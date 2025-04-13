<template>
    <div class="node-modal">
        {{ node }}
        <h2>Node Comments</h2>

        <div class="comment-list">
            <div v-for="(comment, index) in comments" :key="index" class="comment-item">
                <p><strong>{{ comment.text }}</strong></p>
                <p class="stars">
                    <span v-for="n in comment.stars" :key="n">⭐</span>
                </p>
            </div>
        </div>

        <el-form :model="form" ref="formRef" label-width="120px" class="comment-form">
            <el-form-item label="Comment">
                <el-input type="textarea" v-model="form.comment" placeholder="Leave a comment..." />
            </el-form-item>

            <el-form-item label="Rating">
                <el-rate v-model="form.stars" :max="5" />
            </el-form-item>

            <el-form-item>
                <el-button type="primary" @click="submitComment">Submit</el-button>
            </el-form-item>
        </el-form>
    </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

defineProps({
    node: Object
})

const formRef = ref(null)
const form = reactive({
    comment: '',
    stars: 0
})

const comments = ref([
    { text: 'Great place with easy access!', stars: 5 },
    { text: 'Not wheelchair friendly', stars: 2 }
])

function submitComment() {
    if (form.comment && form.stars > 0) {
        comments.value.push({
            text: form.comment,
            stars: form.stars
        })

        form.comment = ''
        form.stars = 0
    }
}
</script>

<style scoped>
.node-modal {
    padding: 20px;
}

.comment-list {
    margin-bottom: 20px;
}

.comment-item {
    margin-bottom: 10px;
    padding: 8px;
    border-bottom: 1px solid #eee;
}

.stars {
    color: #f7ba2a;
}

.comment-form {
    background: #f9f9f9;
    padding: 15px;
    border-radius: 8px;
}
</style>
