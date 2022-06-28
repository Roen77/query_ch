import { useCallback } from 'react';
import io from 'socket.io-client'
import { baseURL } from '../api/api';


const sockets : {[key:string]: SocketIOClient.Socket} = {};
const useSocket = (workspace?:string) : [SocketIOClient.Socket| undefined, () => void] => {

    const disconnect = useCallback(()=>{
        if(workspace){
            sockets[workspace].disconnect()
            delete sockets[workspace]
        }
    },[workspace])

    if(!workspace){
        return [undefined, disconnect]
    }

    if(!sockets[workspace]){
        sockets[workspace] = io.connect(`${baseURL}/ws-${workspace}`,{
            transports:["websocket"]
        })
    }

    return [sockets[workspace], disconnect]


}
export default useSocket;