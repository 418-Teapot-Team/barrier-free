// stores/comments.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { API_ENDPOINTS } from '@/config'
import axios from 'axios'

export const useCommentsStore = defineStore('comments', () => {
  const commentsByNode = ref({})
  const accessibilityByNode = ref({})

  function addComment(nodeId, comment, stars) {
    // Save locally
    if (!commentsByNode.value[nodeId]) {
      commentsByNode.value[nodeId] = []
    }
    const newComment = {
      id: Date.now(),
      text: comment,
      stars,
      createdAt: new Date(),
    }
    commentsByNode.value[nodeId].push(newComment)

    // Send to backend
    axios
      .post(API_ENDPOINTS.ADD_COMMENT, {
        osm_id: nodeId,
        text: comment,
      })
      .catch((err) => {
        console.error('Failed to post comment:', err)
      })
  }

  function getComments(nodeId) {
    const comments = commentsByNode.value[nodeId] || []

    // Fill in random stars (1–5) if not already set
    comments.forEach((comment) => {
      if (!('stars' in comment)) {
        comment.stars = Math.floor(Math.random() * 5) + 1
      }
    })

    return comments
  }

  // New method to add proposals
  function addProposal(nodeId, text, accessibility) {
    // Send the proposal to the backend
    axios
      .post(API_ENDPOINTS.ADD_PROPOSAL, {
        osm_id: nodeId,
        text: text,
        accessibility: accessibility,
      })
      .then((response) => {
        console.log('Proposal successfully sent:', response.data)
      })
      .catch((err) => {
        console.error('Failed to post proposal:', err)
      })
  }

  function getAccessibility(nodeId) {
    return accessibilityByNode.value[nodeId]
  }

  async function fetchAllComments() {
    try {
      const response = await axios.get(API_ENDPOINTS.NODES)
      const data = response.data

      data.forEach((entry) => {
        const nodeId = entry.osm_id
        const comments = entry.comments.map((comment) => ({
          id: comment.id,
          text: comment.text,
          stars: Math.floor(Math.random() * 5) + 1, // assuming stars are not in API
          user: comment.user,
          createdAt: new Date(comment.created_at),
        }))
        console.log(entry.accessibility)
        accessibilityByNode.value[nodeId] = entry.accessibility
        commentsByNode.value[nodeId] = comments
      })
    } catch (error) {
      console.error('Failed to fetch comments:', error)
    }
  }

  fetchAllComments()

  return {
    commentsByNode,
    getAccessibility,
    addComment,
    getComments,
    addProposal,
  }
})
