export default function Footer() {
  return (
    <footer className="mt-8 border-t border-neutral-200 dark:border-neutral-800 py-4 text-center">
      <p className="text-[10px] text-muted">
        © {new Date().getFullYear()} — Built by kxmXX
      </p>
      <p className="text-[10px] text-muted/60 mt-0.5">
        Questions from DLT Thailand Driving License Manual
      </p>
    </footer>
  );
}
