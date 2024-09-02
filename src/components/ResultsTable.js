import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { CopyIcon, CheckIcon } from 'lucide-react';

const ResultsTable = ({ generatedContent, images }) => {
  const [copiedStates, setCopiedStates] = useState({});

  const copyToClipboard = async (text, id, type) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedStates(prev => ({ ...prev, [`${id}-${type}`]: true }));
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [`${id}-${type}`]: false }));
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <ScrollArea className="h-[600px] w-full rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Image</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Keywords</TableHead>
            <TableHead className="w-[100px]">Token Usage</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {generatedContent.map((content) => (
            <TableRow key={content.id}>
              <TableCell className="p-2">
                <img 
                  src={images.find(img => img.id === content.id)?.preview} 
                  alt={`Preview`} 
                  className="w-24 h-24 object-cover rounded"
                />
              </TableCell>
              <TableCell className="align-top">
                <div className="mb-2 max-h-48 overflow-y-auto">{content.description}</div>
                <div className="text-xs text-gray-500 mt-2">
                  Characters: {content.description.length}, Words: {content.description.split(/\s+/).length}
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => copyToClipboard(content.description, content.id, 'description')}
                  className="mt-2"
                >
                  {copiedStates[`${content.id}-description`] ? <CheckIcon className="h-4 w-4 mr-2" /> : <CopyIcon className="h-4 w-4 mr-2" />}
                  Copy
                </Button>
              </TableCell>
              <TableCell className="align-top">
                <div className="flex flex-wrap gap-1 mb-2">
                  {content.keywords.map((keyword, keywordIndex) => (
                    <span key={keywordIndex} className="bg-gray-100 text-gray-800 rounded-full px-2 py-1 text-xs">
                      {keyword}
                    </span>
                  ))}
                </div>
                <div className="text-xs text-gray-500 mb-2">
                  Keywords: {content.keywords.length}
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => copyToClipboard(content.keywords.join(', '), content.id, 'keywords')}
                >
                  {copiedStates[`${content.id}-keywords`] ? <CheckIcon className="h-4 w-4 mr-2" /> : <CopyIcon className="h-4 w-4 mr-2" />}
                  Copy
                </Button>
              </TableCell>
              <TableCell className="text-center">
                {content.tokenUsage}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
  );
};

export default ResultsTable;