// stores/comments.js
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useCommentsStore = defineStore('comments', () => {
  const commentsByNode = ref({})

  function addComment(nodeId, comment, stars) {
    if (!commentsByNode.value[nodeId]) {
      commentsByNode.value[nodeId] = []
    }
    commentsByNode.value[nodeId].push({
      id: Date.now(), // simple unique ID
      text: comment,
      stars,
      createdAt: new Date(),
    })
  }

  function getComments(nodeId) {
    return commentsByNode.value[nodeId] || []
  }

  return {
    commentsByNode,
    addComment,
    getComments,
  }
})
