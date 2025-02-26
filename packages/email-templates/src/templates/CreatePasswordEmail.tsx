import { Button, Html, Text } from "@react-email/components";

export type CreatePasswordEmailProps = {
  name: string;
  role: string;
  createPasswordLink: string;
};

export const CreatePasswordEmail = ({
  name,
  createPasswordLink,
}: CreatePasswordEmailProps) => {
  return (
    <Html>
      <Text>Hello {name},</Text>
      <Text>
        Please click the button below to set up your new password and complete your account setup.
      </Text>
      <Button href={createPasswordLink}>Create your password</Button>
      <Text>If you did not request this email, please ignore it.</Text>
    </Html>
  );
};

export default CreatePasswordEmail;
