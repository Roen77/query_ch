import axios from "axios";



const request = axios.create({
    baseURL:'http://localhost:3105'
})

export default request