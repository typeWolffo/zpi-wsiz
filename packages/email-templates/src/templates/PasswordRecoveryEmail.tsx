import { Button, Html } from "@react-email/components";

export type PasswordRecoveryEmailProps = {
  email: string;
  name: string;
  resetLink: string;
};

export const PasswordRecoveryEmail = ({ email, name, resetLink }: PasswordRecoveryEmailProps) => {
  return (
    <Html>
      Hello there! {name}({email})<Button href={resetLink}>Reset your password</Button>
    </Html>
  );
};

export default PasswordRecoveryEmail;
