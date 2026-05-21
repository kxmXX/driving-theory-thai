export default function Footer() {
  return (
    <footer className="mt-8 border-t border-neutral-200 dark:border-neutral-800 py-4 text-center">
      <p className="text-[10px] text-muted">
        © {new Date().getFullYear()} —{" "}
        <a
          href="https://github.com/kxmXX"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gov-blue hover:underline"
        >
          Built by kxmXX
        </a>
      </p>
      <p className="text-[10px] text-muted/60 mt-0.5">
        Questions from DLT Thailand Driving License Manual
      </p>
    </footer>
  );
}
