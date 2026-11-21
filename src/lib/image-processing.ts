export type CropArea = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type ResizeOptions = {
  maxWidth: number;
  maxHeight: number;
  mimeType?: string;
  quality?: number;
};

export type CropOptions = {
  outputWidth: number;
  outputHeight: number;
  mimeType?: string;
  quality?: number;
};

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Impossible de charger l'image."));
    image.src = src;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, mimeType: string, quality = 0.92) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
          return;
        }
        reject(new Error("Impossible de générer l'image traitée."));
      },
      mimeType,
      quality,
    );
  });
}

function isLosslessMimeType(mimeType: string) {
  return mimeType === "image/png" || mimeType === "image/webp";
}

function normalizeMimeType(mimeType?: string, fallback = "image/jpeg") {
  if (!mimeType || !mimeType.startsWith("image/")) {
    return fallback;
  }
  return mimeType;
}

async function fileToImage(file: File) {
  const objectUrl = URL.createObjectURL(file);
  try {
    return await loadImage(objectUrl);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export async function cropImageFile(file: File, crop: CropArea, options: CropOptions) {
  const image = await fileToImage(file);
  const mimeType = normalizeMimeType(options.mimeType ?? file.type);
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(options.outputWidth));
  canvas.height = Math.max(1, Math.round(options.outputHeight));
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Impossible d'accéder au canevas de recadrage.");
  }

  if (!isLosslessMimeType(mimeType)) {
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
  }

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    canvas.width,
    canvas.height,
  );

  return canvasToBlob(canvas, mimeType, options.quality ?? 0.92);
}

export async function resizeImageFile(file: File, options: ResizeOptions) {
  const image = await fileToImage(file);
  const mimeType = normalizeMimeType(options.mimeType ?? file.type);
  const maxWidth = Math.max(1, Math.round(options.maxWidth));
  const maxHeight = Math.max(1, Math.round(options.maxHeight));
  const scale = Math.min(maxWidth / image.naturalWidth, maxHeight / image.naturalHeight, 1);
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Impossible d'accéder au canevas de redimensionnement.");
  }

  if (!isLosslessMimeType(mimeType)) {
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
  }

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(image, 0, 0, width, height);

  return canvasToBlob(canvas, mimeType, options.quality ?? 0.92);
}

export function mimeTypeToExtension(mimeType: string) {
  switch (mimeType) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    default:
      return "jpg";
  }
}
