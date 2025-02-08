export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-3xl flex flex-col gap-12 mx-auto my-auto min-h-screen justify-center ">
      {children}
    </div>
  );
}
