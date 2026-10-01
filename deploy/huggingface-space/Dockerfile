# MediVision model API for a Hugging Face Docker Space.
# Space repo root must contain: Dockerfile, README.md, model_api.py,
# requirements.txt, model_multitask_best.weights.h5
FROM python:3.13-slim

RUN apt-get update && apt-get install -y --no-install-recommends libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

RUN useradd -m -u 1000 user
USER user
ENV HOME=/home/user \
    PATH=/home/user/.local/bin:$PATH \
    MODEL_API_PORT=7860 \
    PYTHONUNBUFFERED=1 \
    TF_CPP_MIN_LOG_LEVEL=2
WORKDIR /home/user/app

COPY --chown=user requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

COPY --chown=user model_api.py .
COPY --chown=user model_multitask_best.weights.h5 models/

EXPOSE 7860
CMD ["python", "model_api.py"]
