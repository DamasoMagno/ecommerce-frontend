export function ProductSkeleton() {
  return (
    <main className="grid grid-cols-1 xl:grid-cols-product max-w-7xl mx-auto w-full">
      <section className="animate-pulse bg-white/10 rounded-md md:h-[80vh] h-80 max-h-[670px]" />

      <section className="animate-pulse flex flex-col justify-between gap-8 p-6">
        <div>
          <div className="flex flex-col">
            <div className="bg-white/10 h-8 rounded-md" />
            <div className="bg-white/10  h-4 rounded-md mt-1" />
          </div>

          <div className="flex flex-col mt-4">
            <div className="bg-white/10 h-8 mt-4 rounded-md" />
            <div className="bg-white/10  h-4 rounded-md mt-1" />
          </div>

          <div className="flex flex-col gap-2 mt-6">
            <div className="bg-white/10  h-6 rounded-md mt-1" />

            <div className="bg-white/10  h-4 rounded-md mt-1" />
            <div className="bg-white/10  h-4 rounded-md mt-1" />
          </div>
        </div>

        <div>
          <div className="bg-white/10  h-12 rounded-md mt-1" />
        </div>
      </section>
    </main>
  )
}
