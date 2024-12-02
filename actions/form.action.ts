"use server";

import { FormWithSettings } from "@/@types/form.type";
import { generateUniqueId } from "@/lib/helper";
import { prisma } from "@/lib/prismadb";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { Form, FormSettings } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function fetchFormStats() {
  try {
    const session = getKindeServerSession();
    const user = await session.getUser();

    if (!user) {
      //throw new Error("Unauthorized access to resource");
      return {
        success: false,
        message: "Unauthorized to use this resource",
      };
    }

    const { _sum, _count } = await prisma.form.aggregate({
      where: { userId: user.id },
      _sum: {
        views: true,
        responses: true,
      },
      _count: {
        id: true,
      },
    });

    const views = _sum?.views ?? 0;
    const totalResponses = _sum?.responses ?? 0;
    const totalForms = _count?.id ?? 0;

    const conversionRate = views > 0 ? (totalResponses / views) * 100 : 0;
    //const averageResponses = totalForms > 0 ? responses / totalForms : 0;
    const engagementRate =
      totalForms > 0 ? (totalResponses / totalForms) * 100 : 0;

    return {
      views,
      totalForms,
      totalResponses,
      conversionRate,
      engagementRate,
    };
  } catch (error) {
    return {
      success: false,
      message: "Something went wrong",
    };
  }
}

export async function createForm(data: { name: string; description: string }) {
  try {
    const session = getKindeServerSession();
    const user = await session.getUser();

    if (!user) {
      return {
        success: false,
        message: "Unauthorized to use this resource",
      };
    }

    // DO THIS LATER IN THE VIDEO
    const jsonBlocks = JSON.stringify([
      {
        id: generateUniqueId(),
        blockType: "RowLayout",
        attributes: {},
        isLocked: true,
        childblocks: [
          {
            id: generateUniqueId(),
            blockType: "Heading",
            attributes: {
              label: data.name || "Untitled form", // Use form name
              level: 1, // Default to H1
              fontSize: "4x-large",
              fontWeight: "normal",
            },
          },
          {
            id: generateUniqueId(),
            blockType: "Paragraph",
            attributes: {
              label: "Paragraph",
              text: data.description || "Add a description here.",
              fontSize: "small",
              fontWeight: "normal",
            },
          },
        ],
      },
    ]);

    const formSettings = await prisma.formSettings.create({
      data: {
        primaryColor: "#2d31fa",
        backgroundColor: "#E3EDFD",
        fontFamily: "DM Sans",
      },
    });
    const form = await prisma.form.create({
      data: {
        name: data.name,
        description: data.description,
        userId: user.id,
        creatorName: user.given_name || "",
        settingsId: formSettings.id,
        jsonBlocks,
      },
    });

    if (!form) {
      return {
        success: false,
        message: "Could not create form, please try again",
      };
    }

    revalidatePath("/dashboard");

    return {
      success: true,
      message: "Form created successfully",
      form,
    };
  } catch (error) {
    return {
      success: false,
      message: "Something went wrong",
    };
  }
}

export async function fetchAllForms() {
  try {
    const session = getKindeServerSession();
    const user = await session.getUser();

    if (!user) {
      return {
        success: false,
        message: "Unauthorized to use this resource",
      };
    }

    const form = await prisma.form.findMany({
      where: {
        userId: user.id,
      },
      include: {
        settings: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      success: true,
      message: "Form fetched successfully",
      form,
    };
  } catch (error) {
    return {
      success: false,
      message: "Something went wrong",
    };
  }
}

export async function fetchFormById(formId: string): Promise<{
  form?: FormWithSettings | null;
  success: boolean;
  message: string;
}> {
  try {
    const session = getKindeServerSession();
    const user = await session.getUser();

    if (!user) {
      return {
        success: false,
        message: "Unauthorized to use this resource",
      };
    }

    const form = await prisma.form.findFirst({
      where: {
        userId: user.id,
        formId: formId,
      },
      include: {
        settings: true,
      },
    });

    if (!form) {
      return {
        success: false,
        message: "Form not found",
      };
    }

    return {
      success: true,
      message: "Form fetched successfully",
      form,
    };
  } catch (error) {
    return {
      success: false,
      message: "Something went wrong",
    };
  }
}

export async function UpdateForm(data: {
  formId: string;
  name?: string;
  description?: string;
  jsonBlocks: string;
}) {
  try {
    const { formId, name, description, jsonBlocks } = data;
    const session = getKindeServerSession();
    const user = await session.getUser();

    if (!user) {
      return {
        success: false,
        message: "Unauthorized to use this resource",
      };
    }

    if (!formId || !jsonBlocks) {
      return {
        success: false,
        message: "Invalid input data",
      };
    }
    const form = await prisma.form.update({
      where: { formId: formId },
      data: {
        ...(name && { name }), // Only update if name is provided
        ...(description && { description }), // Only update if description is provided
        jsonBlocks,
      },
    });

    revalidatePath(`/dashboard/form/builder/${formId}`);

    return {
      success: true,
      message: "Form updated successfully",
      data: form,
    };
  } catch (error) {
    return {
      success: false,
      message: "An error occurred while updating the form",
    };
  }
}

export async function UpdatePublish(formId: string, published: boolean) {
  try {
    if (!formId) {
      return {
        success: false,
        message: "FormId is required",
      };
    }
    const form = await prisma.form.update({
      where: { formId },
      data: { published },
    });

    revalidatePath(`/dashboard/form/builder/${formId}`);

    return {
      success: true,
      message: `Form successfully ${published ? "published" : "unpublished"}`,
      published: form.published,
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to update publish status",
    };
  }
}

export async function fetchPublishFormById(formId: string): Promise<{
  form?: FormWithSettings | null;
  success: boolean;
  message: string;
}> {
  try {
    if (!formId) {
      return {
        success: false,
        message: "FormId is required",
      };
    }

    const form = await prisma.form.findFirst({
      where: {
        formId: formId,
        published: true,
      },
      include: {
        settings: true,
      },
    });

    if (!form) {
      return {
        success: false,
        message: "Form not found",
      };
    }

    return {
      success: true,
      message: "Form fetched successfully",
      form,
    };
  } catch (error) {
    return {
      success: false,
      message: "Something went wrong",
    };
  }
}
