import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Mail, Phone, Building2, Megaphone, Star } from "lucide-react";

export default function LeadPipeline({ leads, onUpdateStatus }) {
  const stages = [
    { id: "new", label: "New Leads", color: "bg-blue-100 text-blue-700" },
    { id: "contacted", label: "Contacted", color: "bg-violet-100 text-violet-700" },
    { id: "qualified", label: "Qualified", color: "bg-amber-100 text-amber-700" },
    { id: "negotiating", label: "Negotiating", color: "bg-orange-100 text-orange-700" },
    { id: "converted", label: "Converted", color: "bg-emerald-100 text-emerald-700" }
  ];

  const getLeadsByStage = (stageId) => {
    return leads.filter(l => l.status === stageId);
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    const { draggableId, destination } = result;
    const lead = leads.find(l => l.id === draggableId);
    
    if (lead && lead.status !== destination.droppableId) {
      onUpdateStatus(lead, destination.droppableId);
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-5 gap-4 overflow-x-auto pb-4">
        {stages.map(stage => {
          const stageLeads = getLeadsByStage(stage.id);
          const totalValue = stageLeads.reduce((sum, l) => sum + (parseFloat(l.expected_value) || 0), 0);
          
          return (
            <div key={stage.id} className="min-w-[280px]">
              <Card className="h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Badge className={stage.color}>{stage.label}</Badge>
                    <Badge variant="outline">{stageLeads.length}</Badge>
                  </div>
                  {totalValue > 0 && (
                    <p className="text-xs text-slate-500 mt-2">
                      AED {totalValue.toLocaleString()} potential
                    </p>
                  )}
                </CardHeader>
                <Droppable droppableId={stage.id}>
                  {(provided, snapshot) => (
                    <CardContent
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`space-y-2 min-h-[400px] ${
                        snapshot.isDraggingOver ? "bg-violet-50" : ""
                      }`}
                    >
                      {stageLeads.map((lead, index) => (
                        <Draggable key={lead.id} draggableId={lead.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`p-3 bg-white border rounded-lg hover:shadow-md transition-shadow cursor-move ${
                                snapshot.isDragging ? "shadow-xl rotate-2" : ""
                              }`}
                            >
                              <div className="flex items-start gap-2 mb-2">
                                <Avatar className="w-8 h-8">
                                  <AvatarFallback className={`${
                                    lead.lead_type === "venue_owner" 
                                      ? "bg-indigo-100 text-indigo-700" 
                                      : "bg-violet-100 text-violet-700"
                                  } text-xs`}>
                                    {lead.name?.charAt(0) || "?"}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm text-slate-900 truncate">{lead.name}</p>
                                  {lead.company_name && (
                                    <p className="text-xs text-slate-500 truncate">{lead.company_name}</p>
                                  )}
                                </div>
                                {lead.priority === "high" && (
                                  <Star className="w-4 h-4 text-amber-500 fill-amber-500 flex-shrink-0" />
                                )}
                              </div>
                              
                              <div className="space-y-1 text-xs text-slate-600">
                                <div className="flex items-center gap-1 truncate">
                                  <Mail className="w-3 h-3 flex-shrink-0" />
                                  <span className="truncate">{lead.email}</span>
                                </div>
                                {lead.phone && (
                                  <div className="flex items-center gap-1 truncate">
                                    <Phone className="w-3 h-3 flex-shrink-0" />
                                    <span className="truncate">{lead.phone}</span>
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant="outline" className="text-xs">
                                  {lead.lead_type === "venue_owner" ? (
                                    <><Building2 className="w-2 h-2 mr-1" /> Venue</>
                                  ) : (
                                    <><Megaphone className="w-2 h-2 mr-1" /> Ad</>
                                  )}
                                </Badge>
                                {lead.expected_value && (
                                  <Badge variant="secondary" className="text-xs">
                                    AED {parseFloat(lead.expected_value).toLocaleString()}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </CardContent>
                  )}
                </Droppable>
              </Card>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
}