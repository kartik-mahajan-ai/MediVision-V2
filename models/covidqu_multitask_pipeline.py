# ==========================================================
# COVID-QU-EX Multi-Task Pipeline
# Classification (DenseNet201) + Segmentation (Infection Mask)
# ==========================================================

import os
import cv2
import random
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from tqdm import tqdm

import tensorflow as tf
from tensorflow.keras.applications import DenseNet201
from tensorflow.keras.layers import GlobalAveragePooling2D, Dense, Dropout, Conv2DTranspose, Conv2D, Input, BatchNormalization, Activation
from tensorflow.keras.models import Model
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import ReduceLROnPlateau, EarlyStopping, ModelCheckpoint
from sklearn.metrics import classification_report, confusion_matrix

# ==========================================================
# 1. PARAMETERS & DIRECTORIES
# ==========================================================
IMG_SIZE = 224
BATCH_SIZE = 16
EPOCHS = 30

# SET THIS TO TRUE just to test if the pipeline works instantly!
# SET TO FALSE when you are ready to train it overnight.
FAST_DEBUG_MODE = False

base_dir = "Dataset"
train_dir = os.path.join(base_dir, "Train")
val_dir = os.path.join(base_dir, "Val")
test_dir = os.path.join(base_dir, "Test")

class_names_dict = {
    0: 'COVID-19',
    1: 'Pneumonia',
    2: 'Normal'
}

# ==========================================================
# 2. PREPROCESSING HELPERS
# ==========================================================

def preprocess_image(img_path):
    img = cv2.imread(img_path)
    if img is None:
        raise ValueError(f"Image not found: {img_path}")
    
    # Check if image is RGB and convert to grayscale. 
    # Keras load_img provides RGB arrays, but cv2.imread loads BGR
    if len(img.shape) == 3 and img.shape[2] == 3:
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    else:
        gray = img
        
    gray = gray.astype('uint8')
    
    # Apply CLAHE
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    clahe_img = clahe.apply(gray)
    
    # Convert grayscale back to RGB
    rgb_img = cv2.cvtColor(clahe_img, cv2.COLOR_GRAY2RGB)
    
    # Resize & Normalize the image to [0, 1]
    rgb_img = cv2.resize(rgb_img, (IMG_SIZE, IMG_SIZE))
    rgb_img = rgb_img.astype('float32') / 255.0
    return rgb_img

def load_mask(mask_path):
    if os.path.exists(mask_path):
        mask = cv2.imread(mask_path, cv2.IMREAD_GRAYSCALE)
        if mask is not None:
            mask = cv2.resize(mask, (IMG_SIZE, IMG_SIZE))
            mask = mask.astype('float32') / 255.0
            return np.expand_dims(mask, axis=-1)
            
    # Return blank mask if missing (e.g., for Normal patients)
    return np.zeros((IMG_SIZE, IMG_SIZE, 1), dtype=np.float32)

# ==========================================================
# 3. CUSTOM MULTI-TASK DATA GENERATOR
# ==========================================================

class MultiTaskDataGenerator(tf.keras.utils.Sequence):
    def __init__(self, split_dir, batch_size=32, target_size=(224, 224), shuffle=True, augment=False, **kwargs):
        super().__init__(**kwargs)
        self.split_dir = split_dir
        self.batch_size = batch_size
        self.target_size = target_size
        self.shuffle = shuffle
        self.augment = augment
        
        self.folder_names = ['COVID-19', 'Non-COVID', 'Normal']
        self.classes = ['COVID-19', 'Pneumonia', 'Normal']
        
        self.data = []
        for idx, (folder, cls) in enumerate(zip(self.folder_names, self.classes)):
            img_dir = os.path.join(split_dir, folder, 'images')
            mask_dir = os.path.join(split_dir, folder, 'infection masks')
            
            if not os.path.exists(img_dir):
                continue
                
            for img_name in os.listdir(img_dir):
                img_path = os.path.join(img_dir, img_name)
                mask_path = os.path.join(mask_dir, img_name)
                self.data.append((img_path, mask_path, idx))
                
        self.indices = np.arange(len(self.data))
        if self.shuffle:
            np.random.shuffle(self.indices)
            
    def __len__(self):
        return int(np.ceil(len(self.data) / self.batch_size))
        
    def on_epoch_end(self):
        if self.shuffle:
            np.random.shuffle(self.indices)
            
    def __getitem__(self, index):
        batch_indices = self.indices[index * self.batch_size:(index + 1) * self.batch_size]
        
        batch_images = []
        batch_masks = []
        batch_labels = []
        
        for idx in batch_indices:
            img_path, mask_path, label = self.data[idx]
            
            img = preprocess_image(img_path)
            mask = load_mask(mask_path)
            
            if hasattr(self, 'augment') and self.augment:
                # Random horizontal flip for robustness
                if random.random() > 0.5:
                    img = np.fliplr(img)
                    mask = np.fliplr(mask)
            
            batch_images.append(img)
            batch_masks.append(mask)
            batch_labels.append(label)
            
        return (np.array(batch_images), 
                {'classification_head': np.array(batch_labels), 
                 'segmentation_head': np.array(batch_masks)})

print("Preparing Data Generators...")
train_gen = MultiTaskDataGenerator(train_dir, batch_size=BATCH_SIZE, shuffle=True, augment=True)
val_gen = MultiTaskDataGenerator(val_dir, batch_size=BATCH_SIZE, shuffle=False)
test_gen = MultiTaskDataGenerator(test_dir, batch_size=BATCH_SIZE, shuffle=False)

print(f"Found Train samples: {len(train_gen.data)}")
print(f"Found Val samples: {len(val_gen.data)}")
print(f"Found Test samples: {len(test_gen.data)}")

# ==========================================================
# 4. BUILD MULTI-TASK MODEL & LOSSES
# ==========================================================

def dice_coef(y_true, y_pred, smooth=1e-6):
    y_true_f = tf.cast(tf.keras.backend.flatten(y_true), tf.float32)
    y_pred_f = tf.keras.backend.flatten(y_pred)
    intersection = tf.keras.backend.sum(y_true_f * y_pred_f)
    return (2. * intersection + smooth) / (tf.keras.backend.sum(y_true_f) + tf.keras.backend.sum(y_pred_f) + smooth)

def bce_dice_loss(y_true, y_pred):
    bce = tf.keras.losses.binary_crossentropy(y_true, y_pred)
    # Average BCE over spatial dimensions if not already
    bce = tf.reduce_mean(bce) 
    dice_loss = 1.0 - dice_coef(y_true, y_pred)
    return bce + dice_loss

def build_multitask_model(input_shape=(224, 224, 3)):
    inputs = Input(shape=input_shape)
    
    # DenseNet Backbone
    base_model = DenseNet201(weights='imagenet', include_top=False, input_tensor=inputs)
    
    # Freeze the pre-trained layers initially
    for layer in base_model.layers:
        layer.trainable = False
    # Unfreeze the later layers for fine tuning
    for layer in base_model.layers[137:]:
        layer.trainable = True

    # -----------------------------------
    # Branch 1: Classification Head
    # -----------------------------------
    x_cls = base_model.output
    x_cls = GlobalAveragePooling2D()(x_cls)
    x_cls = Dense(256, activation='relu')(x_cls)
    x_cls = Dropout(0.2)(x_cls)
    x_cls = Dense(128, activation='relu')(x_cls)
    x_cls = Dropout(0.2)(x_cls)
    cls_output = Dense(3, activation='softmax', name='classification_head')(x_cls)

    # -----------------------------------
    # Branch 2: Segmentation Head
    # -----------------------------------
    # Output of DenseNet is (7, 7, 1920) for 224x224 input
    x_seg = base_model.output 
    
    # Stack of Conv2DTranspose layers to upscale back to 224x224
    for filters in [512, 256, 128, 64, 32]:
        x_seg = Conv2DTranspose(filters, (3, 3), strides=(2, 2), padding='same')(x_seg)
        x_seg = BatchNormalization()(x_seg)
        x_seg = Activation('relu')(x_seg)
    
    # Final layer predicting 0 to 1 for the infection probability per pixel
    seg_output = Conv2D(1, (1, 1), activation='sigmoid', padding='same', name='segmentation_head')(x_seg)

    model = Model(inputs=inputs, outputs=[cls_output, seg_output])

    optimizer = Adam(learning_rate=5e-4)
    
    # Compile with two losses
    # Using sparse_categorical_crossentropy because labels are scalar (0, 1, 2)
    model.compile(optimizer=optimizer,
                  loss={'classification_head': 'sparse_categorical_crossentropy',
                        'segmentation_head': bce_dice_loss},
                  loss_weights={'classification_head': 1.0, 'segmentation_head': 1.0}, # Increased seg weight
                  metrics={'classification_head': 'accuracy',
                           'segmentation_head': [dice_coef, 'accuracy']})
                           
    return model

model = build_multitask_model()
model.summary()

# ==========================================================
# 5. CALLBACKS & TRAINING
# ==========================================================

reduce_lr = ReduceLROnPlateau(
    monitor="val_loss",
    patience=3,
    min_delta=0.01,
    factor=0.1,
    cooldown=4,
    verbose=1
)

early_stopping = EarlyStopping(
    monitor='val_loss',
    patience=5,
    restore_best_weights=True,
    verbose=1
)

checkpoint = ModelCheckpoint(
    "model_multitask_best.weights.h5",
    monitor='val_classification_head_accuracy',
    mode='max',
    save_best_only=True,
    save_weights_only=True,
    verbose=1
)

class TqdmProgressCallback(tf.keras.callbacks.Callback):
    def on_epoch_begin(self, epoch, logs=None):
        self.epochs = self.params['epochs']
        self.steps = self.params['steps']
        print(f"\nEpoch {epoch+1}/{self.epochs}")
        self.progbar = tqdm(total=self.steps, desc="Training", unit="batch", leave=True)

    def on_batch_end(self, batch, logs=None):
        self.progbar.update(1)

    def on_epoch_end(self, epoch, logs=None):
        if logs is not None:
            postfix = {}
            for k, v in logs.items():
                if isinstance(v, (float, np.float32, np.float64)):
                    postfix[k] = f"{v:.4f}"
            self.progbar.set_postfix(**postfix)
        self.progbar.close()

tqdm_cb = TqdmProgressCallback()

if __name__ == "__main__":
    print("\nStarting Training...\n")
    if FAST_DEBUG_MODE:
        print("\n[FAST DEBUG MODE ENABLED] Running extremely fast dummy training to instantly show you the output visualizations!\n")
        history = model.fit(
            train_gen,
            validation_data=val_gen,
            epochs=1,
            steps_per_epoch=5,
            validation_steps=2,
            callbacks=[reduce_lr, early_stopping, checkpoint, tqdm_cb],
            verbose=0
        )
        test_steps = 5
    else:
        history = model.fit(
            train_gen,
            validation_data=val_gen,
            epochs=EPOCHS,
            callbacks=[reduce_lr, early_stopping, checkpoint, tqdm_cb],
            verbose=0
        )
        test_steps = None

    # ==========================================================
    # 6. EVALUATION
    # ==========================================================

    print("\nEvaluating on Test Set...")
    eval_results = model.evaluate(test_gen, steps=test_steps)
    print(f"Test Multi-Task Total Loss: {eval_results[0]}")
    print(f"Test Classification Loss: {eval_results[1]}")
    print(f"Test Segmentation Loss: {eval_results[2]}")
    print(f"Test Classification Accuracy: {eval_results[3]}")
    print(f"Test Segmentation Accuracy: {eval_results[4]}")

    # Confusion matrix
    print("\nGenerating Classification Report...")
    y_pred_cls_all = []
    y_true_all = []

    for i, (images, target_dict) in enumerate(tqdm(test_gen, desc="Predicting Test Set")):
        if FAST_DEBUG_MODE and i >= test_steps:
            break
            
        preds = model.predict(images, verbose=0)
        cls_preds = np.argmax(preds[0], axis=1)
        
        y_pred_cls_all.extend(cls_preds)
        y_true_all.extend(target_dict['classification_head'])

    print(classification_report(y_true_all, y_pred_cls_all, target_names=test_gen.classes))

    # ==========================================================
    # 7. VISUALIZATION OF PREDICTIONS
    # ==========================================================

    def visualize_multitask_predictions(model, generator, num_images_per_class=2):
        # Segregate indices by class to ensure a diverse mix of classes
        class_indices = {0: [], 1: [], 2: []}
        for idx in range(len(generator.data)):
            _, _, label = generator.data[idx]
            class_indices[label].append(idx)
            
        random_indices = []
        for label in class_indices:
            sample_size = min(num_images_per_class, len(class_indices[label]))
            random_indices.extend(random.sample(class_indices[label], sample_size))
            
        random.shuffle(random_indices) # Shuffle so the classes don't appear in the same order
        
        images = []
        raw_images = []
        true_masks = []
        true_labels = []
        
        for idx in random_indices:
            img_path, mask_path, label = generator.data[idx]
            
            # 1. Load raw image for visualization (Input of Lungs)
            r_img = cv2.imread(img_path)
            if r_img is not None:
                if len(r_img.shape) == 3 and r_img.shape[2] == 3:
                    r_img = cv2.cvtColor(r_img, cv2.COLOR_BGR2RGB)
                else:
                    r_img = cv2.cvtColor(r_img, cv2.COLOR_GRAY2RGB)
                r_img = cv2.resize(r_img, (224, 224))
                r_img = r_img.astype('float32') / 255.0
            else:
                r_img = np.zeros((224, 224, 3), dtype='float32')
            
            raw_images.append(r_img)
            images.append(preprocess_image(img_path))
            true_masks.append(load_mask(mask_path))
            true_labels.append(label)
            
        images = np.array(images)
        raw_images = np.array(raw_images)
        true_masks = np.array(true_masks)
        true_labels = np.array(true_labels)
        
        # Predict
        preds = model.predict(images, verbose=0)
        cls_preds = preds[0]
        seg_preds = preds[1]
        
        # Setup Grad-CAM model based on DenseNet201
        has_gradcam = False
        try:
            # 'relu' is typically the last base layer of DenseNet201 
            last_conv_layer_name = 'relu'
            grad_model = tf.keras.models.Model(
                inputs=[model.inputs],
                outputs=[model.get_layer(last_conv_layer_name).output, model.get_layer('classification_head').output]
            )
            has_gradcam = True
        except ValueError:
            has_gradcam = False
        
        for i in range(len(images)):
            img = images[i]
            r_img = raw_images[i]
            true_label_idx = int(true_labels[i])
            pred_label_idx = int(np.argmax(cls_preds[i]))
            
            true_mask = true_masks[i].squeeze()
            pred_mask_prob = seg_preds[i].squeeze()
            
            # Predict binary mask based on >0.5 threshold
            pred_mask_bw = (pred_mask_prob > 0.5).astype(np.float32)
            
            true_class = class_names_dict[true_label_idx]
            pred_class = class_names_dict[pred_label_idx]
            
            title_color = 'darkgreen' if true_class == pred_class else 'darkred'
            
            fig = plt.figure(figsize=(22, 5))
            fig.suptitle(f"Image {i+1} - Predicted: {pred_class} | True: {true_class}", color=title_color, fontsize=16, fontweight='bold', y=1.05)
            
            # 1. Input of Lungs (Raw)
            plt.subplot(1, 5, 1)
            plt.imshow(r_img)
            plt.title('1. Input of Lungs', fontsize=12, fontweight='bold')
            plt.axis('off')
            
            # 2. CLAHE Preprocessed Image
            plt.subplot(1, 5, 2)
            plt.imshow(img)
            plt.title('2. CLAHE Image', fontsize=12, fontweight='bold')
            plt.axis('off')
            
            # 3. Ground Truth Infection Mask
            plt.subplot(1, 5, 3)
            plt.imshow(true_mask, cmap='gray')
            plt.title('3. Ground Truth Mask', fontsize=12, fontweight='bold')
            plt.axis('off')
            
            # 4. Predicted Mask (Black & White)
            plt.subplot(1, 5, 4)
            plt.imshow(pred_mask_bw, cmap='gray')
            plt.title('4. Predicted Mask (B&W)', fontsize=12, fontweight='bold')
            plt.axis('off')
            
            # 5. Grad-CAM Overlay 
            plt.subplot(1, 5, 5)
            if has_gradcam:
                with tf.GradientTape() as tape:
                    img_tensor = tf.expand_dims(img, axis=0)
                    conv_outputs, predictions = grad_model(img_tensor)
                    loss = predictions[:, pred_label_idx]
                grads = tape.gradient(loss, conv_outputs)
                pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))
                conv_outputs = conv_outputs[0]
                heatmap = conv_outputs @ pooled_grads[..., tf.newaxis]
                heatmap = tf.squeeze(heatmap)
                heatmap = tf.maximum(heatmap, 0) / tf.math.reduce_max(heatmap)
                heatmap = heatmap.numpy()
                
                # In case heatmap generation fails/is blank
                if not np.isnan(heatmap).any() and np.max(heatmap) > 0:
                    heatmap_resized = cv2.resize(heatmap, (224, 224))
                    heatmap_resized = np.uint8(255 * heatmap_resized)
                    jet_map = cv2.applyColorMap(heatmap_resized, cv2.COLORMAP_JET)
                    jet_map = cv2.cvtColor(jet_map, cv2.COLOR_BGR2RGB) / 255.0
                    
                    cam_overlay = jet_map * 0.4 + img * 0.6
                    cam_overlay = np.clip(cam_overlay, 0, 1)
                    plt.imshow(cam_overlay)
                else:
                    plt.imshow(img)
                plt.title('5. Grad-CAM (Classification)', fontsize=12, fontweight='bold')
            else:
                plt.imshow(pred_mask_prob, cmap='jet')
                plt.title('5. Prob. Heatmap', fontsize=12, fontweight='bold')
            plt.axis('off')
            
            plt.tight_layout()
            plt.show()

    print("\nVisualizing some results...")
    visualize_multitask_predictions(model, test_gen, num_images_per_class=2)

    print("\nPipeline Complete!")
