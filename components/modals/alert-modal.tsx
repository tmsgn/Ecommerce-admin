"use client"

import { useEffect, useState } from "react";
import { Modal } from "../ui/modal";
import { Button } from "../ui/button";

interface AlertModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    loading: boolean;
}
export const AlertModal: React.FC<AlertModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    loading
}) => {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(()=>{
        setIsMounted(true);
    }, []);
       
    if (!isMounted) {
        return null;
    }

    return(
        <Modal title="Are you sure?" description="This action can't be undone" isOpen={isOpen} onClose={onClose}>
            <div className="p-6 flex flex-col-reverse gap-2 items-stretch justify-end w-full sm:flex-row sm:items-center sm:space-x-2 sm:gap-0">
                <Button
                    disabled={loading}
                    variant="destructive"
                    onClick={onClose}
                    className="w-full sm:w-auto"
                >
                    Cancel
                </Button>
                <Button
                    disabled={loading}
                    variant="default"
                    onClick={onConfirm}
                    className="w-full sm:w-auto"
                >
                    {loading ? "Loading..." : "Continue"}
                </Button>
            </div>
        </Modal>
    )
};