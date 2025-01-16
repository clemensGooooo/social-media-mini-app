<template>
  <div class="image-previews">
    <div v-for="(image, index) in imagePreviews" :key="index" class="image-preview" @click="showImage(image.previewUrl)">
      <div class="image-container">
        <img :src="image.previewUrl" alt="Uploaded Image Preview" />
      </div>
      <button @click.stop="$emit('remove', index)" class="remove-button">&times;</button>
    </div>
  </div>
  
  <div v-if="selectedImage" class="image-modal" @click="selectedImage = null">
    <div class="modal-content" @click.stop>
      <button class="close-button" @click="selectedImage = null">&times;</button>
      <img :src="selectedImage" alt="Large Preview" />
    </div>
  </div>
</template>

<script>
export default {
  props: {
    imagePreviews: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      selectedImage: null
    };
  },
  methods: {
    showImage(url) {
      this.selectedImage = url;
    }
  }
};
</script>

<style scoped>
.image-previews {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-top: 20px;
  justify-content: center;
}

.image-preview {
  position: relative;
  width: 180px;
  overflow: hidden;
  border: 2px solid #555;
  border-radius: 10px;
  background-color: #333;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease;
  cursor: pointer;
}

.image-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.image-container img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 8px;
}

.image-preview:hover {
  transform: scale(1.05);
}

.remove-button {
  position: absolute;
  top: 5px;
  right: 5px;
  background: rgba(255, 0, 0, 0.85);
  width: 28px;
  height: 28px;
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: background 0.3s ease, transform 0.2s ease;
}

.remove-button:hover {
  background: rgba(255, 0, 0, 1);
  transform: scale(1.1);
}

.image-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  position: relative;
  background: #000;
  padding: 10px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(255, 255, 255, 0.2);
}

.modal-content img {
  max-width: 90vw;
  max-height: 90vh;
  object-fit: contain;
  border-radius: 10px;
}

.close-button {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(255, 0, 0, 0.85);
  width: 32px;
  height: 32px;
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  transition: background 0.3s ease, transform 0.2s ease;
}

.close-button:hover {
  background: rgba(255, 0, 0, 1);
  transform: scale(1.1);
}
</style>
