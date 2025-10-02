import React, { useMemo, useState } from "react";
import { Table, Tag, Typography, Button, Input, Select, App } from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import { createProduct, type Product } from "../../api/products";
import { useProductsByProject } from "../../hooks/useProducts";
import { BasicModal } from "../../components/Modal/BasicModal";
import { PlusOutlined } from "@ant-design/icons";
import { useForm, Controller, type SubmitHandler } from "react-hook-form";
import type { ProductPayload } from "../../types/common";
import { LabelForm } from "../../components/Text/LabelForm";
import { useQueryClient } from "@tanstack/react-query";

type ProductsQueryData = {
  items: Product[];
  total: number;
  page: number;
  limit: number;
};

export function ProductTab({ projectId }: { projectId: string }) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [open, setOpen] = useState(false);
  const { notification } = App.useApp();
  const queryClient = useQueryClient();
  const { control, handleSubmit, setValue } = useForm<ProductPayload>({
    defaultValues: {
      name: "",
      package_id: "",
      project_id: projectId,
      provider: "google_play_billing",
      type: "subscription",
      status: "published",
    },
  });

  // Ensure project_id is always set to current projectId
  React.useEffect(() => {
    setValue("project_id", projectId);
  }, [projectId, setValue]);

  const onSubmit: SubmitHandler<ProductPayload> = async (data) => {
    try {
      const response = await createProduct(data);
      console.log(response);

      notification.success({
        message: "Product Created",
        description: `Product has been created successfully.`,
        placement: "topRight",
        duration: 4.5,
      });

      setOpen(false);
      setPage(1);
      setLimit(10);

      // Refetch the products data
      queryClient.invalidateQueries({
        queryKey: ["products", { projectId }],
      });
    } catch (error) {
      console.error(error);
      notification.error({
        message: "Failed to Create Product",
        description: "Failed to create product",
        placement: "topRight",
        duration: 4.5,
      });
    }
  };

  const { data, isLoading } = useProductsByProject({ projectId, page, limit });
  const productsData = data as ProductsQueryData | undefined;

  const columns: ColumnsType<Product> = useMemo(
    () => [
      { title: "ID", dataIndex: "id", key: "id" },
      { title: "Name", dataIndex: "name", key: "name" },
      { title: "Package ID", dataIndex: "packageId", key: "packageId" },
      { title: "Provider", dataIndex: "provider", key: "provider" },
      { title: "Type", dataIndex: "type", key: "type" },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        render: (status: Product["status"]) => (
          <Tag color={status === "published" ? "green" : "red"}>{status}</Tag>
        ),
      },
      //   {
      //     title: "Actions",
      //     key: "actions",
      //     render: () => (
      //       <Space>
      //         <Button type="link">View</Button>
      //         <Button type="link">Edit</Button>
      //       </Space>
      //     ),
      //   },
    ],
    []
  );

  const pagination: TablePaginationConfig = useMemo(
    () => ({
      current: productsData?.page ?? page,
      pageSize: productsData?.limit ?? limit,
      total: productsData?.total ?? 0,
      showSizeChanger: true,
      pageSizeOptions: [10, 20, 50, 100],
    }),
    [productsData, page, limit]
  );
  const showModal = () => {
    setOpen(true);
  };

  return (
    <div className="p-4 space-y-4 flex flex-col gap-4 w-full">
      <div className="flex flex-row w-full items-center justify-between bg-white p-4 rounded-lg">
        <Typography.Title level={5} className="!mb-0">
          Products
        </Typography.Title>
        <Button type="primary" onClick={showModal} icon={<PlusOutlined />}>
          Create Product
        </Button>
      </div>
      <Table<Product>
        rowKey="id"
        loading={isLoading}
        columns={columns}
        dataSource={productsData?.items || []}
        pagination={pagination}
        onChange={(p) => {
          if (p.current) setPage(p.current);
          if (p.pageSize) setLimit(p.pageSize);
        }}
      />
      <BasicModal
        open={open}
        onCancel={() => setOpen(false)}
        title="Create Product"
        isLoading={false}
      >
        <div className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <LabelForm label="Product Name">
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="Enter product name"
                      className="w-full"
                    />
                  )}
                />
              </LabelForm>

              <LabelForm label="Package ID">
                <Controller
                  name="package_id"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="Enter package ID"
                      className="w-full"
                    />
                  )}
                />
              </LabelForm>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <LabelForm label="Provider">
                <Controller
                  name="provider"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      placeholder="Select provider"
                      className="w-full"
                      options={[
                        {
                          value: "google_play_billing",
                          label: "Google Play Billing",
                        },
                        { value: "apple_store", label: "Apple Store" },
                        { value: "stripe", label: "Stripe" },
                      ]}
                    />
                  )}
                />
              </LabelForm>

              <LabelForm label="Type">
                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      placeholder="Select type"
                      className="w-full"
                      options={[
                        { value: "subscription", label: "Subscription" },
                        { value: "live_time", label: "Live Time" },
                        { value: "consumable", label: "Consumable" },
                        { value: "non_consumable", label: "Non Consumable" },
                      ]}
                    />
                  )}
                />
              </LabelForm>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <LabelForm label="Status">
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      placeholder="Select status"
                      className="w-full"
                      options={[
                        { value: "published", label: "Published" },
                        { value: "draft", label: "Draft" },
                        { value: "archive", label: "Archive" },
                      ]}
                    />
                  )}
                />
              </LabelForm>

              <LabelForm label="Project ID">
                <Controller
                  name="project_id"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="Project ID"
                      className="w-full"
                      disabled
                    />
                  )}
                />
              </LabelForm>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit">
                Create Product
              </Button>
            </div>
          </form>
        </div>
      </BasicModal>
    </div>
  );
}

export default ProductTab;
