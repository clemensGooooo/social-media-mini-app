const sanitizer_names = (input) => {
    return input.replace(/[^a-zA-Z0-9.\s]/g, '');
}

const sanitizer_bio = (input) => {
    return input.replace(/[^a-zA-Z0-9.\s\']/g, '');
}

const isEmailValid = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

module.exports = { sanitizer_names, isEmailValid,sanitizer_bio };
