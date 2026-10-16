import { getProductById } from "@/lib/data";
import { notFound } from "next/navigation";
import { BarcodeLabel } from "@/components/admin/barcode-label";

export default async function ProductBarcodePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const product = await getProductById(id);

    if (!product) {
        notFound();
    }

    return <BarcodeLabel product={product} />;
}
