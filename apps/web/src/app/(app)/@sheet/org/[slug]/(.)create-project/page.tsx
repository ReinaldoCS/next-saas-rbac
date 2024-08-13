import { ProjectForm } from '@/app/(app)/org/[slug]/create-project/project-form'
import { InterceptedSheetContent } from '@/components/intercepted-sheet-content'
import { Sheet, SheetHeader, SheetTitle } from '@/components/ui/sheet'

export default function CreateOrganization() {
  return (
    <Sheet defaultOpen>
      <InterceptedSheetContent>
        <SheetHeader>
          <SheetTitle>Project</SheetTitle>
          <div className="py-4">
            <ProjectForm />
          </div>
        </SheetHeader>
      </InterceptedSheetContent>
    </Sheet>
  )
}
