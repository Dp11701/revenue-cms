import React, { useMemo, useState, useCallback } from "react";
import {
  Table,
  Tag,
  Typography,
  Button,
  Input,
  Select,
  App,
  Dropdown,
} from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import {
  createProduct,
  deleteProduct,
  getProduct,
  updateProduct,
  type Product,
} from "../../api/products";
import { useProductsByProject } from "../../hooks/useProducts";
import { BasicModal } from "../../components/Modal/BasicModal";
import {
  PlusOutlined,
  EyeOutlined,
  DeleteOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useForm, Controller, type SubmitHandler } from "react-hook-form";
import type { ProductPayload } from "../../types/common";
import { LabelForm } from "../../components/Text/LabelForm";
import { useQueryClient } from "@tanstack/react-query";
import { ConfirmModal } from "../../components/Modal/ConfirmModal";

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
  const [editOpen, setEditOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");

  const { notification } = App.useApp();
  const queryClient = useQueryClient();
  const { control, handleSubmit, setValue } = useForm<ProductPayload>({
    defaultValues: {
      name: "",
      package_id: "",
      project_id: projectId,
      provider: "google_play_billing",
      type: "auto_sub",
      status: "published",
    },
  });

  // Ensure project_id is always set to current projectId
  React.useEffect(() => {
    setValue("project_id", projectId);
  }, [projectId, setValue]);

  const onSubmit: SubmitHandler<ProductPayload> = async (data) => {
    try {
      if (productToEdit) {
        // Update existing product
        await updateProduct(projectId, productToEdit.id, data);
        notification.success({
          message: "Product Updated",
          description: `Product has been updated successfully.`,
          placement: "topRight",
          duration: 4.5,
        });
        setEditOpen(false);
        setProductToEdit(null);
      } else {
        // Create new product
        const response = await createProduct(data);
        console.log(response);
        notification.success({
          message: "Product Created",
          description: `Product has been created successfully.`,
          placement: "topRight",
          duration: 4.5,
        });
        setOpen(false);
      }

      setPage(1);
      setLimit(10);

      // Refetch the products data
      queryClient.invalidateQueries({
        queryKey: ["products", { projectId }],
      });
    } catch (error) {
      console.error(error);
      const action = productToEdit ? "Update" : "Create";
      notification.error({
        message: `Failed to ${action} Product`,
        description: `Failed to ${action.toLowerCase()} product`,
        placement: "topRight",
        duration: 4.5,
      });
    }
  };

  const handleEditClick = useCallback(
    async (product: Product) => {
      try {
        // Fetch the latest product data
        const productData = await getProduct(projectId, product.id);
        setProductToEdit(productData);

        // Pre-fill the form with product data
        setValue("name", productData.name);
        setValue("package_id", productData.packageId);
        setValue(
          "provider",
          productData.provider as
            | "google_play_billing"
            | "apple_store"
            | "stripe"
        );
        setValue(
          "type",
          productData.type as
            | "auto_sub"
            | "non_auto_sub"
            | "consumable"
            | "non_consumable"
        );
        setValue(
          "status",
          productData.status as "published" | "draft" | "archive"
        );

        setEditOpen(true);
      } catch (error) {
        console.error(error);
        notification.error({
          message: "Failed to Load Product",
          description: "Failed to load product data for editing",
          placement: "topRight",
          duration: 4.5,
        });
      }
    },
    [projectId, setValue, notification]
  );

  const handleDeleteClick = useCallback((product: Product) => {
    setProductToDelete(product);
    setConfirmOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!productToDelete) return;

    try {
      await deleteProduct(projectId, productToDelete.id);
      notification.success({
        message: "Product Deleted",
        description: `Product "${productToDelete.name}" has been deleted successfully.`,
        placement: "topRight",
        duration: 4.5,
      });
      queryClient.invalidateQueries({
        queryKey: ["products", { projectId }],
      });
      setConfirmOpen(false);
      setProductToDelete(null);
    } catch (error) {
      console.error(error);
      notification.error({
        message: "Failed to Delete Product",
        description: "Failed to delete product",
        placement: "topRight",
        duration: 4.5,
      });
    }
  }, [projectId, productToDelete, notification, queryClient]);

  const { data, isLoading } = useProductsByProject({ projectId, page, limit });
  const productsData = data as ProductsQueryData | undefined;

  // Client-side search filtering (current page only)
  const filteredBySearch = useMemo(() => {
    const items = productsData?.items ?? [];
    const query = searchTerm.trim().toLowerCase();
    if (!query) return items;
    return items.filter((product) => {
      const idMatch = product.id.toLowerCase().includes(query);
      const nameMatch = product.name.toLowerCase().includes(query);
      const pkgMatch = product.packageId.toLowerCase().includes(query);
      return idMatch || nameMatch || pkgMatch;
    });
  }, [productsData?.items, searchTerm]);

  const columns: ColumnsType<Product> = useMemo(
    () => [
      {
        title: "ID",
        dataIndex: "id",
        key: "id",
        width: "15%",
      },
      {
        title: "Name",
        dataIndex: "name",
        key: "name",
        width: "20%",
      },
      {
        title: "Package ID",
        dataIndex: "packageId",
        key: "packageId",
        width: "20%",
      },
      {
        title: "Provider",
        dataIndex: "provider",
        key: "provider",
        filters: [
          { text: "Google Play Billing", value: "google_play_billing" },
          { text: "Apple Store", value: "apple_store" },
          { text: "Stripe", value: "stripe" },
        ],
        filterMode: "tree",
        filterSearch: true,
        onFilter: (value, record) => record.provider === value,
        width: "15%",
      },
      {
        title: "Type",
        dataIndex: "type",
        key: "type",
        filters: [
          { text: "Auto Subscription", value: "auto_sub" },
          { text: "Non Auto Subscription", value: "non_auto_sub" },
          { text: "Consumable", value: "consumable" },
          { text: "Non Consumable", value: "non_consumable" },
        ],
        filterMode: "tree",
        filterSearch: true,
        onFilter: (value, record) => record.type === value,
        width: "15%",
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        filters: [
          { text: "Published", value: "published" },
          { text: "Draft", value: "draft" },
          { text: "Archive", value: "archive" },
        ],
        filterMode: "tree",
        filterSearch: true,
        onFilter: (value, record) => record.status === value,
        render: (status: Product["status"]) => (
          <Tag color={status === "published" ? "green" : "red"}>{status}</Tag>
        ),
        width: "15%",
      },
      {
        title: "Actions",
        key: "actions",
        className: "flex justify-center",
        render: (_, record: Product) => {
          const menuItems = [
            {
              key: "edit",
              label: "Edit",
              onClick: () => {
                handleEditClick(record);
              },
            },
            {
              key: "delete",
              label: "Delete",
              icon: <DeleteOutlined />,
              danger: true,
              onClick: () => {
                handleDeleteClick(record);
              },
            },
          ];

          return (
            <Dropdown
              menu={{ items: menuItems }}
              trigger={["click"]}
              placement="bottomRight"
            >
              <Button type="text" icon={<EyeOutlined />} />
            </Dropdown>
          );
        },
      },
    ],
    [handleEditClick, handleDeleteClick]
  );

  const pagination: TablePaginationConfig = useMemo(
    () => ({
      current: productsData?.page ?? page,
      pageSize: productsData?.limit ?? limit,
      total: productsData?.total ?? 0,
      showSizeChanger: false,
      pageSizeOptions: [10],
    }),
    [productsData, page, limit]
  );
  const showModal = () => {
    setOpen(true);
  };

  return (
    <div className="p-4 space-y-4 flex flex-col gap-4 w-full">
      {/* Header with Filters */}
      <div className="bg-white p-4 rounded-lg space-y-4">
        {/* Top Row - Title, Search, and Create Button */}
        <div className="flex flex-row w-full items-center justify-between gap-4">
          <Typography.Title level={5} className="!mb-0">
            Products
          </Typography.Title>

          <div className="flex flex-row  items-center justify-between gap-4">
            {" "}
            <div className="flex items-center gap-4 flex-1 w-96">
              <Input
                placeholder="Search by name, package ID, or ID"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                prefix={<SearchOutlined />}
                allowClear
                className="flex-1"
              />
            </div>
            <Button type="primary" onClick={showModal} icon={<PlusOutlined />}>
              Create Product
            </Button>
          </div>
        </div>
      </div>
      <Table<Product>
        rowKey="id"
        loading={isLoading}
        columns={columns}
        dataSource={filteredBySearch}
        sticky
        scroll={{ y: 480, x: "max-content" }}
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
                        { value: "auto_sub", label: "Auto Subscription" },
                        {
                          value: "non_auto_sub",
                          label: "Non Auto Subscription",
                        },
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

      {/* Edit Product Modal */}
      <BasicModal
        open={editOpen}
        onCancel={() => {
          setEditOpen(false);
          setProductToEdit(null);
        }}
        title="Edit Product"
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
                        { value: "auto_sub", label: "Auto Subscription" },
                        {
                          value: "non_auto_sub",
                          label: "Non Auto Subscription",
                        },
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
              <Button
                onClick={() => {
                  setEditOpen(false);
                  setProductToEdit(null);
                }}
              >
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                Update Product
              </Button>
            </div>
          </form>
        </div>
      </BasicModal>

      <ConfirmModal
        open={confirmOpen}
        onCancel={() => {
          setConfirmOpen(false);
          setProductToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Product"
        okText="Delete"
        okType="danger"
        cancelText="Cancel"
      >
        <div className="delete-confirmation-content">
          <Typography.Text className="delete-warning-text">
            Are you sure you want to delete{" "}
            <strong>"{productToDelete?.name}"</strong>? This action cannot be
            undone.
          </Typography.Text>
        </div>
      </ConfirmModal>
    </div>
  );
}

export default ProductTab;
