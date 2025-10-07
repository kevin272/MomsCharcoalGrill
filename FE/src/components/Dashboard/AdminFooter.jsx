export default function AdminFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="copyright-wrap">
      <p className="copyright-text">
        © {year} Sabhapokhari Hydropower Ltd | © 2025 All Rights Reserved
      </p>
    </footer>
  );
}
