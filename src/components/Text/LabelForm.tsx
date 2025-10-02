import { Typography } from "antd";

export const LabelForm = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => {
  return (
    <div>
      <Typography.Text className="text-sm font-[600] py-2 block">
        {label}
      </Typography.Text>
      {children}
    </div>
  );
};
