const getUser = (req, res) => {
    res.json({ message: 'User data retrieved successfully' });
}

const createUser = (req, res) => {
    res.json({ message: 'User created successfully' });
}

const updateUser = (req, res) => {
    res.json({ message: 'User updated successfully' });
}

const deleteUser = (req, res) => {
    res.json({ message: 'User deleted successfully' });
}

export { getUser, createUser, updateUser, deleteUser };