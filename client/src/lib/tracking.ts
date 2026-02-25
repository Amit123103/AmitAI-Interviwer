
let filesetResolver: any | null = null;

export const initializeFaceLandmarker = async () => {
    const { FaceLandmarker, FilesetResolver } = await import("@mediapipe/tasks-vision");

    if (!filesetResolver) {
        filesetResolver = await FilesetResolver.forVisionTasks(
            "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.32/wasm"
        );
    }

    const faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
        baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
            delegate: "CPU"
        },
        outputFaceBlendshapes: true,
        runningMode: "VIDEO",
        numFaces: 1
    });

    return faceLandmarker;
};
