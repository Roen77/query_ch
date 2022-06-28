import axios from "axios";

export const baseURL = 'http://localhost:3105'


const request = axios.create({
    baseURL
})

export default request