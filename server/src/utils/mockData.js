// This file provides mock data functions for testing purposes when MongoDB is not available.

const mockUsers = [];
const mockRabbis = [];
const mockShiurim = [];
let mockUserCounter = 1;

const createMockUser = (userData) => {
  const user = {
    _id: `user_${mockUserCounter++}`,
    ...userData,
    interests: userData.interests || [],
    favorites: userData.favorites || [],
    following: userData.following || [],
    createdAt: new Date()
  };
  mockUsers.push(user);
  return user;
};

const findMockUser = (query) => {
  if (query._id) return mockUsers.find(u => u._id === query._id);
  if (query.email) return mockUsers.find(u => u.email === query.email);
  if (query.$or) {
    return mockUsers.find(u => 
      query.$or.some(condition => 
        (condition.email && u.email === condition.email) ||
        (condition.username && u.username === condition.username)
      )
    );
  }
  return null;
};

const updateMockUser = (id, updates) => {
  const userIndex = mockUsers.findIndex(u => u._id === id);
  if (userIndex !== -1) {
    mockUsers[userIndex] = { ...mockUsers[userIndex], ...updates };
    return mockUsers[userIndex];
  }
  return null;
};

const initializeMockData = () => {
  // Initialize mock data for users, rabbis, and shiurim if needed
};

module.exports = {
  createMockUser,
  findMockUser,
  updateMockUser,
  initializeMockData,
  mockUsers,
  mockRabbis,
  mockShiurim
};