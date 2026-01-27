import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { PhotoUploader } from "@/components/PhotoUploader";
import { ColorTagger } from "@/components/ColorTagger";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { db } from "@/db";
import type { Gear } from "@/types";
import { ChevronLeft, ChevronRight, Save } from "lucide-react";

export default function AddGear() {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [step, setStep] = useState<1 | 2>(1);
    const [photos, setPhotos] = useState<{ hero?: string, serial?: string, feature?: string }>({});
    const [formData, setFormData] = useState<Partial<Gear>>({
        purchaseDate: new Date().toISOString().split('T')[0],
        lifespan: 5,
        visualTagColor: ''
    });

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.manufacturer || !formData.model) {
            toast.error(t('addGear.toastError')); // Using toastError as generic for required fields for now or need specific trans key
            return;
        }

        try {
            const now = Date.now();
            const newGear: Gear = {
                id: crypto.randomUUID(),
                name: `${formData.manufacturer} ${formData.model}`,
                manufacturer: formData.manufacturer,
                model: formData.model,
                category: formData.category || 'Other',
                subCategory: formData.subCategory,
                serialNumber: formData.serialNumber,
                photos: {
                    hero: photos.hero || '',
                    serial: photos.serial,
                    feature: photos.feature
                },
                visualTagColor: formData.visualTagColor,
                status: 'Available', // Default status
                purchaseDate: formData.purchaseDate!,
                purchasePrice: Number(formData.purchasePrice) || 0,
                lifespan: Number(formData.lifespan) || 5,
                createdAt: now,
                updatedAt: now
            } as Gear;

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
                                    selectedColor={formData.visualTagColor}
                                    onSelect={(c) => setFormData(prev => ({ ...prev, visualTagColor: c }))}
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
                    <form onSubmit={handleSubmit} className="space-y-6 animate-in slide-in-from-right fade-in duration-300">
                        <div className="bg-card p-6 rounded-lg border space-y-4">
                            <h2 className="text-lg font-semibold">{t('addGear.step2')}</h2>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>{t('addGear.manufacturer')}</Label>
                                    <Input
                                        placeholder="e.g. Shure"
                                        value={formData.manufacturer || ''}
                                        onChange={e => setFormData({ ...formData, manufacturer: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>{t('addGear.model')}</Label>
                                    <Input
                                        placeholder="e.g. SM58"
                                        value={formData.model || ''}
                                        onChange={e => setFormData({ ...formData, model: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>{t('addGear.category')}</Label>
                                    <Input
                                        placeholder="e.g. Microphone"
                                        value={formData.category || ''}
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>{t('addGear.serialNumber')}</Label>
                                    <Input
                                        placeholder=""
                                        value={formData.serialNumber || ''}
                                        onChange={e => setFormData({ ...formData, serialNumber: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-card p-6 rounded-lg border space-y-4">
                            <h2 className="text-lg font-semibold">{t('addGear.financials')}</h2>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label>{t('addGear.purchaseDate')}</Label>
                                    <Input
                                        type="date"
                                        value={formData.purchaseDate || ''}
                                        onChange={e => setFormData({ ...formData, purchaseDate: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>{t('addGear.price')}</Label>
                                    <Input
                                        type="number"
                                        placeholder="0"
                                        value={formData.purchasePrice || ''}
                                        onChange={e => setFormData({ ...formData, purchasePrice: Number(e.target.value) })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>{t('addGear.lifespan')}</Label>
                                    <Input
                                        type="number"
                                        placeholder="5"
                                        value={formData.lifespan || ''}
                                        onChange={e => setFormData({ ...formData, lifespan: Number(e.target.value) })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between">
                            <Button type="button" variant="ghost" onClick={() => setStep(1)} className="gap-2">
                                <ChevronLeft className="h-4 w-4" /> {t('addGear.back')}
                            </Button>
                            <Button type="submit" className="gap-2">
                                <Save className="h-4 w-4" /> {t('addGear.save')}
                            </Button>
                        </div>
                    </form>
                )}
            </div>
        </Layout>
    );
}
