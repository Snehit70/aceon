interface StripedBackgroundProps {
  scoped?: boolean;
}

export function StripedBackground({ scoped = false }: StripedBackgroundProps) {
  const position = scoped ? "absolute" : "fixed";
  
  return (
    <>
      <div className={`${position} inset-0 bg-[url('/images/halftone.svg')] opacity-5 pointer-events-none mix-blend-screen z-0`} />
      <div className={`${position} inset-0 bg-[url('/images/noise.svg')] opacity-10 pointer-events-none mix-blend-overlay z-0`} />
      <div 
        className={`${position} inset-0 opacity-10 pointer-events-none z-0`}
        style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 4px,
            #ffffff 4px,
            #ffffff 5px
          )`
        }}
      />
      <div className={`${position} inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none z-0`} />
    </>
  );
}
