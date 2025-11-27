import Image from "next/image";

export const EmptyNotesState = () => {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <Image
        width={450}
        height={450}
        src="/empty-notes.png"
        alt="Bubble tea empty"
      />
      <p className="text-2xl inter-regular text-foreground">
        I'm just here waiting for your charming notes...
      </p>
    </div>
  );
};
