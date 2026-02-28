let IS_PROD = true;
const server = IS_PROD ?
    "https://nexusbackend-goc9.onrender.com" :

    "http://localhost:8000"


export default server;