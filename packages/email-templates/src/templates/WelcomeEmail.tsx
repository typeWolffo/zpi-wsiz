import { Body, Button, Container, Head, Html, Text } from "@react-email/components";

export type WelcomeEmailProps = {
  name: string;
  activationLink: string;
};

export const WelcomeEmail = ({ name, activationLink }: WelcomeEmailProps) => {
  return (
    <Html>
      <Head />
      <Body>
        <Container>
          <Text>Hello {name},</Text>
          <Text>
            Thank you for registering. Please activate your account by clicking the button below:
          </Text>
          <Button href={activationLink}>Activate Account</Button>
          <Text>If you did not create an account, please ignore this email.</Text>
        </Container>
      </Body>
    </Html>
  );
};

export default WelcomeEmail;
