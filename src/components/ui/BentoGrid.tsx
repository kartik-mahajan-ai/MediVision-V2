import { cn } from "@/lib/utils";

export const BentoGrid = ({
    className,
    children,
}: {
    className?: string;
    children?: React.ReactNode;
}) => {
    return (
        <div
            className={cn(
                "grid md:auto-rows-[18rem] grid-cols-1 md:grid-cols-3 gap-4 max-w-7xl mx-auto ",
                className
            )}
        >
            {children}
        </div>
    );
};

export const BentoGridItem = ({
    className,
    title,
    description,
    header,
    icon,
}: {
    className?: string;
    title?: string | React.ReactNode;
    description?: string | React.ReactNode;
    header?: React.ReactNode;
    icon?: React.ReactNode;
}) => {
    return (
        <div
            className={cn(
                "row-span-1 rounded-3xl group/bento transition duration-500 p-6 flex flex-col space-y-4",
                "bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl shadow-black/20",
                "hover:border-bio-emerald/30 hover:shadow-bio-emerald/5 hover:-translate-y-1 hover:animate-membrane",
                className
            )}
        >
            <div className="rounded-2xl overflow-hidden mb-4 h-full">
                {header}
            </div>
            <div className="transition duration-300">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-bio-emerald/10 text-bio-emerald-light">
                        {icon}
                    </div>
                   <div className="font-sans font-bold text-foreground text-lg">
                        {title}
                    </div>
                </div>
                <div className="font-sans font-normal text-muted-foreground text-sm leading-relaxed">
                    {description}
                </div>
            </div>
        </div>
    );
};
