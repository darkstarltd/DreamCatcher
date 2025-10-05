
import React, { useContext } from 'react';
import { SettingsContext } from '../context/SettingsContext';

interface TagData {
    name: string;
    count: number;
}

interface TagCloudProps {
    data: TagData[];
}

const TagCloud: React.FC<TagCloudProps> = ({ data }) => {
    const settingsContext = useContext(SettingsContext);
    if (!settingsContext) return null;
    const { dreamSigns } = settingsContext;

    if (data.length === 0) {
        return <div className="flex items-center justify-center h-full text-purple-400">No tags recorded yet.</div>;
    }
    
    const minCount = Math.min(...data.map(d => d.count));
    const maxCount = Math.max(...data.map(d => d.count));

    // Normalize count to a font size range (e.g., 14px to 32px)
    const getFontSize = (count: number) => {
        if (maxCount === minCount) return 16;
        const sizeRange = 22; // max_size(36) - min_size(14)
        const countRange = maxCount - minCount;
        const size = 14 + (count - minCount) * sizeRange / countRange;
        return Math.round(size);
    };
    
    // Normalize count to an opacity range (e.g., 0.6 to 1.0)
    const getOpacity = (count: number) => {
        if (maxCount === minCount) return 0.8;
        const opacityRange = 0.5; // max_opacity(1.0) - min_opacity(0.5)
        const countRange = maxCount - minCount;
        return 0.5 + (count - minCount) * opacityRange / countRange;
    };

    return (
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 h-full content-center">
            {data.map(tag => {
                const isDreamSign = dreamSigns.has(tag.name);
                return (
                    <span
                        key={tag.name}
                        className={`transition-all duration-300 ${isDreamSign ? 'text-yellow-300 font-bold drop-shadow-[0_0_5px_rgba(250,204,21,0.7)]' : 'text-purple-300'}`}
                        style={{
                            fontSize: `${getFontSize(tag.count)}px`,
                            opacity: isDreamSign ? 1 : getOpacity(tag.count),
                            lineHeight: '1.2'
                        }}
                    >
                        {tag.name}
                    </span>
                );
            })}
        </div>
    );
};

export default TagCloud;
