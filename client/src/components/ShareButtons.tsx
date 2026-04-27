import { useState } from "react";
import { Share2, Check, MessageCircle, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

interface ShareButtonsProps {
  url?: string;
  title?: string;
  description?: string;
}

export default function ShareButtons({ 
  url = typeof window !== 'undefined' ? window.location.href : '',
  title = "Caperberry Laundry - Premium Fabric Care in Lagos",
  description = "Premium laundry and dry cleaning services. 13+ years serving Lagos. Free pickup & delivery."
}: ShareButtonsProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(`${title}\n\n${description}\n\n${url}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast({
        title: "Link copied!",
        description: "Share it with your friends and family.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please copy the link manually.",
        variant: "destructive",
      });
    }
  };

  // Check if native share is available
  const canNativeShare = typeof navigator !== 'undefined' && navigator.share;

  const handleNativeShare = async () => {
    if (canNativeShare) {
      try {
        await navigator.share({
          title,
          text: description,
          url,
        });
      } catch (err) {
        // User cancelled or error - do nothing
      }
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="gap-2"
        >
          <Share2 className="h-4 w-4" />
          Share
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        
        {canNativeShare && (
          <DropdownMenuItem onClick={handleNativeShare}>
            <Share2 className="mr-2 h-4 w-4" />
            Share...
          </DropdownMenuItem>
        )}
        
        <DropdownMenuItem onClick={handleWhatsAppShare}>
          <MessageCircle className="mr-2 h-4 w-4" />
          Share on WhatsApp
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handleCopyLink}>
          {copied ? (
            <>
              <Check className="mr-2 h-4 w-4 text-green-600" />
              Copied!
            </>
          ) : (
            <>
              <LinkIcon className="mr-2 h-4 w-4" />
              Copy Link
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
