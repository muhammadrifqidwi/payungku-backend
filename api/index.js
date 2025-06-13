export default function handler(req, res) {
  if (req.method === "GET") {
    return res.status(200).send("Main API route works!");
  }

  res.status(405).end(`Method ${req.method} Not Allowed`);
}
