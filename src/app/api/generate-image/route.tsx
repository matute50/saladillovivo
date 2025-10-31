import { ImageResponse } from "next/og";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const title = searchParams.get("title") || "Saladillo Vivo";
    const image = searchParams.get("image") || "https://www.saladillovivo.com.ar/logo.png";
    const logoUrl = "https://storage.googleapis.com/hostinger-horizons-assets-prod/77d159f1-0d45-4b01-ba42-c8ca9cbd0d70/e9eb6580b7ad5742826daaa5df2b592d.png";

    return new ImageResponse(
      (
        <div
          style={{
            width: "800px",
            height: "1000px",
            backgroundColor: "#ffffff",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-start",
            fontFamily: "sans-serif",
            overflow: "hidden",
          }}
        >
          {/* Fondo de la noticia */}
          <div
            style={{
              width: "800px",
              height: "600px",
              backgroundImage: `url(${image})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />

          {/* Franja del título */}
          <div
            style={{
              backgroundColor: "#003399",
              color: "white",
              width: "100%",
              padding: "40px 50px",
              fontSize: 48,
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            {title}
          </div>

          {/* Logo inferior */}
          <div
            style={{
              width: "100%",
              height: "120px",
              backgroundColor: "#6699ff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img
              src={logoUrl}
              width="160"
              height="80"
              style={{ objectFit: "contain" }}
            />
          </div>
        </div>
      ),
      {
        width: 800,
        height: 1000,
      }
    );
  } catch (error) {
    console.error("Error generando imagen:", error);
    return new Response("Error generando imagen", { status: 500 });
  }
}
