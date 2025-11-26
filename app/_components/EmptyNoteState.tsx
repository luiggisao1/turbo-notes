import Image from "next/image";

export const EmptyNotesState = () => {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <Image
        src="/empty-notes.png"
        alt="Bubble tea empty"
        className="w-64 h-64 mb-8"
      />
      <p className="text-2xl font-serif text-muted-foreground">
        I'm just here waiting for your charming notes...
      </p>
    </div>
  );
};
