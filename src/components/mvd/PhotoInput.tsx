import Icon from '@/components/ui/icon';

interface Props {
  value: string;
  onChange: (dataUrl: string) => void;
  className?: string;
}

const PhotoInput = ({ value, onChange, className }: Props) => {
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <label
      className={`group relative flex cursor-pointer items-center justify-center overflow-hidden border-2 border-dashed border-border bg-muted/40 transition hover:border-primary ${className ?? 'h-44 w-36'}`}
    >
      {value ? (
        <img src={value} alt="фото" className="h-full w-full object-cover" />
      ) : (
        <div className="flex flex-col items-center gap-1 text-muted-foreground">
          <Icon name="Camera" size={28} />
          <span className="text-xs">Загрузить фото</span>
        </div>
      )}
      <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </label>
  );
};

export default PhotoInput;
