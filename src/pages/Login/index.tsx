import axios, { AxiosError } from "axios";
import React, { useCallback, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { Navigate, useNavigate } from "react-router-dom";
import useInput from "../../hooks/useInput";
import { IUser } from "../../typings/db";
import fetcher from "../../utils/fetcher";
import {
  Button,
  Form,
  Header,
  Input,
  Label,
  LinkContainer,
  Error,
} from "../Signup/styles";

const Login = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { isLoading, isSuccess, status, isError, data, error } = useQuery(
    "user",
    () => fetcher({ queryKey: "/api/users", log: "login" })
  );

  const mutation = useMutation<
    IUser,
    AxiosError,
    { email: string; password: string }
  >(
    "user",
    (data) =>
      axios
        .post("/api/users/login", data, {
          withCredentials: true,
        })
        .then((response) => response.data),
    {
      onMutate() {
        setLogInError(false);
      },
      onSuccess() {
        queryClient.refetchQueries("user");
      },
    }
  );
  const [logInError, setLogInError] = useState(false);
  const [email, onChangeEmail] = useInput("");
  const [password, onChangePassword] = useInput("");
  const onSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      mutation.mutate({ email, password });
      //   setLogInError(false);
      //   axios
      //     .post(
      //       "/api/users/login",
      //       { email, password },
      //       {
      //         withCredentials: true,
      //       }
      //     )
      //     .then(() => {})
      //     .catch((error) => {
      //       setLogInError(error.response?.data?.code === 401);
      //     });
      // },
    },
    [email, password, mutation]
  );

  if (isLoading) {
    return <div>로딩중...</div>;
  }

  if (data) {
    // return <Navigate to="/workspace/1/channel/4" />;
    return <Navigate to="/workspace/sleact/channel/일반" />;
  }
  return (
    <div id="container">
      <Header>sign</Header>
      <Form onSubmit={onSubmit}>
        <Label id="email-label">
          <span>이메일 주소</span>
          <div>
            <Input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={onChangeEmail}
            />
          </div>
        </Label>
        <Label id="password-label">
          <span>비밀번호</span>
          <div>
            <Input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={onChangePassword}
            />
          </div>
          {logInError && (
            <Error>이메일과 비밀번호 조합이 일치하지 않습니다.</Error>
          )}
        </Label>
        <Button type="submit">로그인</Button>
      </Form>
      <LinkContainer>
        아직 회원이 아니신가요?&nbsp;
        <a href="/signup">회원가입 하러가기</a>
      </LinkContainer>
    </div>
  );
};

export default Login;
