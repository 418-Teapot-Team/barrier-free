<template>
    <div class="node-modal">
        <h2>Details</h2>
        <p>The node accessibility is: <strong>{{ nodeAccessibility }}</strong></p>
        <div class="comment-list">
            <div v-for="(comment, index) in nodeComments" :key="index" class="comment-item">
                <p><strong>{{ comment.text }}</strong></p>
                <p class="comment-email">{{ comment.user?.email || 'Anonymous' }}</p>
                <p class="stars">
                    <span v-for="n in comment.stars" :key="n">⭐</span>
                </p>
            </div>
        </div>

        <!-- Comment Form -->
        <el-form :model="form" ref="formRef" label-width="120px" class="comment-form">
            <el-form-item label="Comment">
                <el-input type="textarea" v-model="form.comment" placeholder="Leave a comment..."
                    :disabled="!authStore.isAuthenticated" />
            </el-form-item>

            <el-form-item label="Rating">
                <el-rate v-model="form.stars" :max="5" :disabled="!authStore.isAuthenticated" />
            </el-form-item>

            <el-form-item>
                <el-button type="primary" @click="submitForm('comment')"
                    :disabled="!authStore.isAuthenticated || !form.comment || !form.stars">
                    Submit
                </el-button>
            </el-form-item>
        </el-form>

        <!-- Accessibility Form -->
        <el-form :model="accessibilityForm" ref="accessibilityFormRef" label-width="120px" class="comment-form">
            <el-form-item label="Accessibility Type">
                <el-select v-model="accessibilityForm.accessibility" placeholder="Select accessibility type"
                    :disabled="!authStore.isAuthenticated">
                    <el-option label="Full" value="full" />
                    <el-option label="Partial" value="partial" />
                    <el-option label="None" value="none" />
                </el-select>
            </el-form-item>

            <el-form-item label="Comment">
                <el-input type="textarea" v-model="accessibilityForm.comment" placeholder="Leave a comment..."
                    :disabled="!authStore.isAuthenticated" />
            </el-form-item>

            <el-form-item>
                <el-button type="primary" @click="submitForm('accessibility')"
                    :disabled="!authStore.isAuthenticated || !accessibilityForm.comment || !accessibilityForm.accessibility">
                    Submit
                </el-button>
            </el-form-item>
        </el-form>

        <div v-if="!authStore.isAuthenticated" class="auth-warning">
            Please log in to leave a comment or propose a change.
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useCommentsStore } from '@/stores/comments'
import { useAuthStore } from '@/stores/auth'

const props = defineProps({
    node: Object
})

const authStore = useAuthStore()
const commentsStore = useCommentsStore()

const formRef = ref(null)
const accessibilityFormRef = ref(null)

const form = reactive({
    comment: '',
    stars: 0
})

const accessibilityForm = reactive({
    comment: '',
    accessibility: ''
})

// Computed comments for this node from store
const nodeComments = computed(() =>
    commentsStore.getComments(props.node.osm_id)
)

const nodeAccessibility = computed(() =>
    commentsStore.getAccessibility(props.node.osm_id)
)

function submitForm(formType) {
    if (formType === 'comment' && form.comment && form.stars > 0) {
        commentsStore.addComment(props.node.osm_id, form.comment, form.stars)
        form.comment = ''
        form.stars = 0
    } else if (formType === 'accessibility' && accessibilityForm.comment && accessibilityForm.accessibility) {
        // Add accessibility-related comment logic (this can be expanded as per your backend needs)
        commentsStore.addProposal(props.node.osm_id, accessibilityForm.comment, accessibilityForm.accessibility)
        accessibilityForm.comment = ''
        accessibilityForm.accessibility = ''
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

.comment-email {
    color: gray;
    font-size: 0.9em;
    margin-top: -5px;
    margin-bottom: 5px;
}

.auth-warning {
    color: red;
    font-weight: bold;
    margin-top: 10px;
}
</style>
