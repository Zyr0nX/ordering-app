import type { NextApiRequest, NextApiResponse } from "next";

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<{
    data: {
      url: string;
    } | null;
    error: string | null;
  }>
) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({
      data: null,
      error: "Method Not Allowed",
    });
    return;
  }

  res.status(200).json({
    data: {
      url: "/uploaded-file-url",
    },
    error: null,
  });
};

export const config = {
  api: {
    bodyParser: false,
  },
};

export default handler;
