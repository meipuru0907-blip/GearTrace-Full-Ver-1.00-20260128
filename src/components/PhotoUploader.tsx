import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { cn } from '@/lib/utils';
import { Camera } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface PhotoUploaderProps {
    photos: {
        hero?: string;
        serial?: string;
        feature?: string;
    };
    onPhotoChange: (type: 'hero' | 'serial' | 'feature', dataUrl: string) => void;
}

export function PhotoUploader({ photos, onPhotoChange }: PhotoUploaderProps) {
    const { t } = useLanguage();

    const processFile = (file: File, type: 'hero' | 'serial' | 'feature') => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target?.result as string;
            onPhotoChange(type, result);
        };
        reader.readAsDataURL(file);
    };

    const PhotoZone = ({ type, label, currentImage }: { type: 'hero' | 'serial' | 'feature', label: string, currentImage?: string }) => {
        const onDrop = useCallback((acceptedFiles: File[]) => {
            if (acceptedFiles.length > 0) {
                processFile(acceptedFiles[0], type);
            }
        }, [type]);

        const { getRootProps, getInputProps, isDragActive } = useDropzone({
            onDrop,
            accept: { 'image/*': [] },
            multiple: false
        });

        return (
            <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    {label}
                </label>
                <div
                    {...getRootProps()}
                    className={cn(
                        "relative flex aspect-video cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-muted-foreground/25 bg-muted/50 hover:bg-muted transition-colors",
                        isDragActive && "bg-accent border-primary",
                        currentImage && "border-solid p-0 overflow-hidden"
                    )}
                >
                    <input {...getInputProps()} />
                    {currentImage ? (
                        <div className="relative w-full h-full group">
                            <img src={currentImage} alt={label} className="h-full w-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs">
                                {t('addGear.changePhoto')}
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-1 text-muted-foreground">
                            <Camera className="h-6 w-6" />
                            <span className="text-xs">{t('addGear.uploadPlaceholder')}</span>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <PhotoZone type="hero" label={t('addGear.uploadHero')} currentImage={photos.hero} />
            <PhotoZone type="serial" label={t('addGear.uploadSerial')} currentImage={photos.serial} />
            <PhotoZone type="feature" label={t('addGear.uploadFeature')} currentImage={photos.feature} />
        </div>
    );
}
