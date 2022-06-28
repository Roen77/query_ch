import { IDM } from "../typings/db";
import dayjs from 'dayjs';
export default function makeSection(chatList:IDM[]){

    const sections: {[key:string]:IDM[]} = {}

    chatList.forEach(chat => {
        const monthDate =dayjs(chat.createdAt).format('YYYY-MM-DD');

        if(Array.isArray(sections[monthDate])){
            sections[monthDate].push(chat)
        }else {
            sections[monthDate] = [chat]
        }
    })

    return sections
}

// sections = {'2021-01-01':[1],'2022-02-02':[3]}
