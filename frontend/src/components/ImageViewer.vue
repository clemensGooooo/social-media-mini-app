<template>
    <div class="image-viewer">
        <div v-if="images.length > 1" class="image-navigation">
            <button @click="prevImage" :disabled="currentIndex === 0" class="nav-button left">←</button>
        </div>

        <div class="image-display">
            <img :src="images[currentIndex]" alt="Post Image" class="post-image">
        </div>

        <div v-if="images.length > 1" class="image-navigation">
            <button @click="nextImage" :disabled="currentIndex === images.length - 1" class="nav-button right">→</button>
        </div>
    </div>
</template>
  
<script>
export default {
    props: {
        images: {
            type: Array,
            required: true,
        }
    },
    data() {
        return {
            currentIndex: 0
        };
    },
    methods: {
        prevImage() {
            if (this.currentIndex > 0) {
                this.currentIndex--;
            }
        },
        nextImage() {
            if (this.currentIndex < this.images.length - 1) {
                this.currentIndex++;
            }
        }
    }
};
</script>
  
<style scoped>
.image-viewer {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.image-display {
  margin: 10px 0;
  position: relative;
}

.post-image {
  max-width: 100%;
  object-fit: contain;
  display: block;
}

.nav-button {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  padding: 10px;
  background-color: rgba(255, 255, 255, 0.7);
  border: 2px solid #ddd;
  cursor: pointer;
  border-radius: 50%;
  font-size: 18px;
  transition: background-color 0.3s ease;
  z-index:1;
}

.nav-button:disabled {
  background-color: #e0e0e0;
  cursor: not-allowed;
}

.nav-button.left {
  left: 10px;
}

.nav-button.right {
  right: 10px;
}

.nav-button:hover {
  background-color: rgba(255, 255, 255, 1);
}
</style>
  