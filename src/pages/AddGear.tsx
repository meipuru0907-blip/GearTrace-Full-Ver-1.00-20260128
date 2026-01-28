import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { PhotoUploader } from "@/components/PhotoUploader";
import { ColorTagger } from "@/components/ColorTagger";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { db } from "@/db";
import type { Gear } from "@/types";
import { ChevronRight } from "lucide-react";
import { GearForm, type GearFormValues } from "@/components/features/gear-form/GearForm";

export default function AddGear() {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [step, setStep] = useState<1 | 2>(1);
    const [photos, setPhotos] = useState<{ hero?: string, serial?: string, feature?: string }>({});
    const [tempVisualTag, setTempVisualTag] = useState<string>('');

    const handlePhotoChange = (type: 'hero' | 'serial' | 'feature', dataUrl: string) => {
        setPhotos(prev => ({ ...prev, [type]: dataUrl }));
    };

    const handleNext = () => {
        if (!photos.hero) {
            toast.error(t('addGear.toastPhotoRequired'));
            return;
        }
        setStep(2);
    };

    const handleFormSubmit = async (values: GearFormValues) => {
        if (!values.manufacturer || !values.model) {
            toast.error(t('addGear.toastError'));
            return;
        }

        try {
            const now = Date.now();
            const newGear: Gear = {
                id: crypto.randomUUID(),
                ...values,
                // Merge photo/tag data from Step 1
                photos: {
                    hero: photos.hero || '',
                    serial: photos.serial,
                    feature: photos.feature
                },
                // If form didn't set a color tag but step 1 did (legacy visual tag), use it
                visualTagColor: tempVisualTag, // Keep for legacy if needed, or mapping
                colorTag: (values.colorTag || (tempVisualTag ? tempVisualTag : undefined)) as Gear['colorTag'],

                createdAt: now,
                updatedAt: now
            };

            await db.gear.add(newGear);
            toast.success(t('addGear.toastSuccess'));
            navigate('/');
        } catch (error) {
            console.error(error);
            toast.error(t('addGear.toastError'));
        }
    };

    return (
        <Layout>
            <div className="max-w-3xl mx-auto">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">{t('addGear.title')}</h1>
                    <div className="text-sm text-muted-foreground">{t('common.step')} {step} {t('common.of')} 2</div>
                </div>

                {step === 1 && (
                    <div className="space-y-6 animate-in slide-in-from-right fade-in duration-300">
                        <div className="bg-card p-6 rounded-lg border space-y-4">
                            <h2 className="text-lg font-semibold">{t('addGear.step1')}</h2>
                            <p className="text-sm text-muted-foreground">
                                {t('addGear.step1Desc')}
                            </p>

                            <PhotoUploader photos={photos as any} onPhotoChange={handlePhotoChange} />

                            <div className="pt-4 border-t">
                                <ColorTagger
                                    selectedColor={tempVisualTag}
                                    onSelect={(c) => setTempVisualTag(c)}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <Button onClick={handleNext} className="gap-2">
                                {t('addGear.next')} <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="animate-in slide-in-from-right fade-in duration-300">
                        <GearForm
                            defaultValues={{
                                // Pre-fill color tag if selected in Step 1
                                colorTag: tempVisualTag as any,
                                category: 'Microphone', // Default recommendation
                                quantity: 1,
                                lifespan: 5
                            }}
                            onSubmit={handleFormSubmit}
                            onCancel={() => setStep(1)}
                            submitLabel={t('addGear.save')}
                        />
                    </div>
                )}
            </div>
        </Layout>
    );
}
