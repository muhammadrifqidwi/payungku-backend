import dbConnect from "../lib/dbConnect";
import {
  getLocations,
  createLocation,
  updateLocation,
  getLocationById,
} from "../controllers/locationController";
import { enableCors } from "../lib/cors";

export default async function handler(req, res) {
  const corsHandled = enableCors(req, res);
  if (corsHandled) return;

  await dbConnect();
  const { id } = req.query;

  try {
    if (req.method === "GET") {
      if (id) return getLocationById(req, res);
      return getLocations(req, res);
    }

    if (req.method === "POST") {
      return createLocation(req, res);
    }

    if (req.method === "PUT") {
      if (!id) return res.status(400).json({ message: "Missing id in query" });
      return updateLocation(req, res);
    }

    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (err) {
    console.error("LOCATION API ERROR:", err);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: err.message });
  }
}
