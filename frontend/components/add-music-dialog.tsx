"use client";

import { LoaderCircle, Upload } from "lucide-react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { toast } from "sonner";
import ApiService from "@/services/api.service";
import { useRef, useState } from "react";
import clsx from "clsx";
import axios, { HttpStatusCode } from "axios";

type Props = {
    guildId: string,
}

export default function AddMusicDialog(props: Props) {
    // const ytLinkInputRef = useRef<string>("");
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const [fileIsUploading, setFileIsUploading] = useState<boolean>(false);
    // const [ytLinkIsUploading, setYtLinkIsUploading] = useState<boolean>(false);
    const [isOpen, setIsOpen] = useState<boolean>(false);

    async function handleUploadButton() {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    }

    async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        if (!file || !file.type.startsWith("audio")) {
            toast.error("Impossible d'uploader le fichier", { description: "Le fichier n'est pas valide." })
            return;
        }

        const reader = new FileReader();

        reader.onload = async (e) => {
            setFileIsUploading(true);
            const arrayBuffer = e.target?.result;

            if (arrayBuffer) {
                try {
                    const response = await ApiService.uploadMusic(props.guildId, file.name, file.type, arrayBuffer)

                    toast.success("Upload réussi", { description: `${file.name} a été uploadé avec succès.` });
                    console.log(response.data);

                    setFileIsUploading(false);
                    setIsOpen(false);
                } catch (err) {
                    if (axios.isAxiosError(err)) {
                        console.log(err);

                        if (err.response?.status === HttpStatusCode.PayloadTooLarge) {
                            toast.error("Impossible d'uploader le fichier", { description: "La taille du fichier ne doit pas dépassé 20Mo" });
                        } else {
                            toast.error("Impossible d'uploader le fichier", { description: err.response?.data.err_message });
                        }
                    } else {
                        toast.error("Erreur inattendue", { description: (err as Error).message });
                    }

                    setFileIsUploading(false);
                }
            }
        };

        reader.readAsArrayBuffer(file);
    }

    return (
        <>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                    <Button><Upload /></Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Importer un fichier</DialogTitle>
                        <DialogDescription>
                            Selectionnez un fichier à ajouter dans la jukebox
                        </DialogDescription>
                    </DialogHeader>
                    <Button variant="outline" type="submit" disabled={fileIsUploading} onClick={handleUploadButton}>
                        Importer un fichier
                        <LoaderCircle className={clsx("animate-spin", {
                            "hidden": !fileIsUploading
                        })} />
                    </Button>
                </DialogContent>
            </Dialog>
            <input
                type="file"
                accept="audio/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: "none" }}
            />
        </>
    )
}