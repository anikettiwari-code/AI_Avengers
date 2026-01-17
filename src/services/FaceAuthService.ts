import * as faceapi from 'face-api.js';
import { supabase } from '../lib/supabase';

// Use a reliable CDN for models so they load without local files
const MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models';

export interface FaceMatchResult {
  studentId: string;
  name?: string;
  distance: number;
  box: any; // Bounding box
}

export class FaceAuthService {
  private static instance: FaceAuthService;
  private modelsLoaded = false;
  private faceMatcher: faceapi.FaceMatcher | null = null;
  
  private constructor() {}

  public static getInstance(): FaceAuthService {
    if (!FaceAuthService.instance) {
      FaceAuthService.instance = new FaceAuthService();
    }
    return FaceAuthService.instance;
  }

  public async loadModels() {
    if (this.modelsLoaded) return;
    
    try {
      console.log("Loading FaceAPI models from CDN...");
      await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
      await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
      await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
      
      this.modelsLoaded = true;
      console.log('Face API Models Loaded Successfully');
      
      // Load known faces from Supabase
      await this.loadLabeledDescriptors();
    } catch (error) {
      console.error('Failed to load face models', error);
    }
  }

  private async loadLabeledDescriptors() {
    try {
      // Fetch all face encodings from Supabase
      const { data, error } = await supabase
        .from('face_encodings')
        .select(`
            user_id,
            descriptor,
            profiles (name)
        `);

      if (error) throw error;

      if (!data || data.length === 0) {
        console.warn("No face data found in Supabase.");
        return;
      }

      const labeledDescriptors = data.map((record: any) => {
        // Parse the descriptor if it's stored as a string/JSON, or use directly if array
        const rawDescriptor = typeof record.descriptor === 'string' 
            ? JSON.parse(record.descriptor) 
            : record.descriptor;
            
        const descriptorArray = new Float32Array(Object.values(rawDescriptor));
        return new faceapi.LabeledFaceDescriptors(
            record.user_id, // Label is the User ID
            [descriptorArray]
        );
      });

      this.faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.6);
      console.log(`Loaded ${labeledDescriptors.length} face profiles from DB.`);

    } catch (err) {
      console.error("Error loading face descriptors:", err);
    }
  }

  // Generate a descriptor from an image element or URL
  public async generateFaceDescriptor(imageInput: HTMLImageElement | HTMLVideoElement | string): Promise<Float32Array | null> {
    if (!this.modelsLoaded) await this.loadModels();

    let input: HTMLImageElement | HTMLVideoElement;

    if (typeof imageInput === 'string') {
        input = await this.createImage(imageInput);
    } else {
        input = imageInput;
    }

    const detection = await faceapi.detectSingleFace(input)
        .withFaceLandmarks()
        .withFaceDescriptor();

    if (!detection) return null;
    return detection.descriptor;
  }

  private createImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = (err) => reject(err);
      img.src = url;
    });
  }

  // Save descriptor to Supabase
  public async enrollStudentFace(userId: string, descriptor: Float32Array) {
    // Convert Float32Array to standard Array for JSON storage
    const descriptorArray = Array.from(descriptor);
    
    // Check if entry exists
    const { data: existing } = await supabase
        .from('face_encodings')
        .select('id')
        .eq('user_id', userId)
        .single();

    if (existing) {
        // Update
        const { error } = await supabase
            .from('face_encodings')
            .update({ descriptor: descriptorArray })
            .eq('user_id', userId);
        if (error) throw error;
    } else {
        // Insert
        const { error } = await supabase
            .from('face_encodings')
            .insert({
                user_id: userId,
                descriptor: descriptorArray
            });
        if (error) throw error;
    }
    
    // Reload matcher to include new face
    await this.loadLabeledDescriptors();
  }

  // 1:N Identification (Classroom Scan)
  public async scanClassroom(imageOrVideo: HTMLVideoElement | HTMLImageElement): Promise<FaceMatchResult[]> {
    if (!this.modelsLoaded) await this.loadModels();
    
    // If no matcher (no faces in DB), return empty
    if (!this.faceMatcher) {
        await this.loadLabeledDescriptors();
        if (!this.faceMatcher) return [];
    }

    // 1. Detect all faces
    const detections = await faceapi.detectAllFaces(imageOrVideo)
        .withFaceLandmarks()
        .withFaceDescriptors();

    const results: FaceMatchResult[] = [];

    // 2. Match each face
    detections.forEach(detection => {
        const bestMatch = this.faceMatcher!.findBestMatch(detection.descriptor);
        
        if (bestMatch.label !== 'unknown') {
            results.push({
                studentId: bestMatch.label,
                distance: bestMatch.distance,
                box: detection.detection.box
            });
        }
    });

    return results;
  }
  
  // 1:1 Verification
  public async verifyFace(videoElement: HTMLVideoElement, _unused?: any): Promise<{ match: boolean; score: number }> {
     const results = await this.scanClassroom(videoElement);
     
     if (results.length > 0) {
         // Return the best match
         return { match: true, score: 1 - results[0].distance };
     }
     return { match: false, score: 0 };
  }
}
