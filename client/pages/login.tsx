import { useFormState } from "react-use-form-state";
import React, { useEffect, useState } from "react";
import { Flex } from "reflexbox/styled-components";
import emailValidator from "email-validator";
import styled from "styled-components";
import Router from "next/router";
import Link from "next/link";
import axios from "axios";

import { useStoreState, useStoreActions } from "../store";
import { ColCenterV } from "../components/Layout";
import AppWrapper from "../components/AppWrapper";
import { TextInput } from "../components/Input";
import { fadeIn } from "../helpers/animations";
import { Button } from "../components/Button";
import Text, { H2 } from "../components/Text";
import ALink from "../components/ALink";
import Icon from "../components/Icon";
import { APIv2 } from "../consts";
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n'

const LoginForm = styled(Flex).attrs({
  as: "form",
  flexDirection: "column"
})`
  animation: ${fadeIn} 0.8s ease-out;
`;

const Email = styled.span`
  font-weight: normal;
  color: #512da8;
  border-bottom: 1px dotted #999;
`;

const LoginPage = () => {
  const { t, i18n } = useTranslation();
  const { isAuthenticated } = useStoreState(s => s.auth);
  const login = useStoreActions(s => s.auth.login);
  const [error, setError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [loading, setLoading] = useState({ login: false, signup: false });
  const [formState, { email, password, label }] = useFormState<{
    email: string;
    password: string;
  }>(null, { withIds: true });

  useEffect(() => {
    if (isAuthenticated) Router.push("/");
  }, [isAuthenticated]);

  function onSubmit(type: "login" | "signup") {
    return async e => {
      e.preventDefault();
      const { email, password } = formState.values;

      if (loading.login || loading.signup) return null;

      if (!email) {
        return setError(t("login.error.emailEmpty"));
      }

      if (!emailValidator.validate(email)) {
        return setError(t("login.error.emailValid"));
      }

      if (password.trim().length < 8) {
        return setError(t("login.error.passwordLenght"));
      }

      setError("");

      if (type === "login") {
        setLoading(s => ({ ...s, login: true }));
        try {
          await login(formState.values);
          Router.push("/");
        } catch (error) {
          setError(error.response.data.error);
        }
      }

      if (type === "signup") {
        setLoading(s => ({ ...s, signup: true }));
        try {
          await axios.post(APIv2.AuthSignup, { email, password });
          setVerifying(true);
        } catch (error) {
          setError(error.response.data.error);
        }
      }

      setLoading({ login: false, signup: false });
    };
  }

  if (isAuthenticated) {
    return null;
  }

  console.log("i18n ",i18n);
  console.log("------------------------------------------------------------------------")
  return (
    <AppWrapper>
      <ColCenterV maxWidth="100%" px={3} flex="0 0 auto" mt={4}>
        {verifying ? (
          <H2 textAlign="center" light>
            {t('login.verificationEmail')}
            <Email>{formState.values.email}</Email>.
          </H2>
        ) : (
          <LoginForm id="login-form" onSubmit={onSubmit("login")}>
            <Text {...label("email")} as="label" mb={2} bold>
              {t('login.email') }
            </Text>
            <TextInput
              {...email("email")}
              placeholder={t('login.email') +"..."}
              height={[56, 64, 72]}
              fontSize={[15, 16]}
              px={[4, 40]}
              mb={[24, 4]}
              width={[300, 400]}
              maxWidth="100%"
              autoFocus
            />
            <Text {...label("password")} as="label" mb={2} bold>
              {t('login.password') + t('login.password2')}
            </Text>
            <TextInput
              {...password("password")}
              placeholder={t('login.password')+"..."}
              px={[4, 40]}
              height={[56, 64, 72]}
              fontSize={[15, 16]}
              width={[300, 400]}
              maxWidth="100%"
              mb={[24, 4]}
            />
            <Flex justifyContent="center">
              <Button
                flex="1 1 auto"
                mr={["8px", 16]}
                height={[44, 56]}
                onClick={onSubmit("login")}
              >
                <Icon
                  name={loading.login ? "spinner" : "login"}
                  stroke="white"
                  mr={2}
                />
                {t('button.login')}
              </Button>
              <Button
                flex="1 1 auto"
                ml={["8px", 16]}
                height={[44, 56]}
                color="purple"
                onClick={onSubmit("signup")}
              >
                <Icon
                  name={loading.signup ? "spinner" : "signup"}
                  stroke="white"
                  mr={2}
                />
                {t('button.signUp')}
              </Button>
            </Flex>
            <Link href="/reset-password">
              <ALink
                href="/reset-password"
                title="Forget password"
                fontSize={14}
                alignSelf="flex-start"
                my={16}
              >
                {t('login.forgotPassword')}
              </ALink>
            </Link>
            <Text color="red" mt={1} normal>
              {error}
            </Text>
          </LoginForm>
        )}
      </ColCenterV>
    </AppWrapper>
  );
};

export default i18n.withTranslation('login')(LoginPage);
