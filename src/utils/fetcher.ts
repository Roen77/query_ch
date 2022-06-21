
import request from "../api/api";

let num = 1;
const fetcher = async ({ queryKey, log }: { queryKey: string, log:string }) => {
  const response = await request.get(queryKey, {
    withCredentials: true,
  });
  console.log("queryKey:,",`${queryKey}`,'호출위치:',log, 'num:', num ++,'data', response.data)
  return response.data;
};

export default fetcher;
