export default function imageLoader({ src }: { src: string; width: number; quality?: number }) {
  // Return the src as-is — S3/Neon Object Storage serves the original file directly.
  // Transformations (resize, format) are not supported server-side with plain S3.
  return src;
}
